"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "~/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "~/components/ui/toggle-group"

export const description = "Waste collection trends across gram panchayats"

type PanchayatData = {
  id: number
  name: string
  lastUpdated: string
  wetWaste: number
  dryWaste: number
  sanitaryWaste: number
}

export function ChartAreaInteractive({ data }: { data: PanchayatData[] }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Transform data for chart - group by month/date
  const chartData = React.useMemo(() => {
    // Group data by lastUpdated date and aggregate waste
    const groupedByDate = data.reduce((acc, item) => {
      const date = item.lastUpdated
      if (!acc[date]) {
        acc[date] = {
          date,
          wetWaste: 0,
          dryWaste: 0,
          sanitaryWaste: 0,
        }
      }
      acc[date].wetWaste += item.wetWaste
      acc[date].dryWaste += item.dryWaste
      acc[date].sanitaryWaste += item.sanitaryWaste
      return acc
    }, {} as Record<string, { date: string; wetWaste: number; dryWaste: number; sanitaryWaste: number }>)

    // Convert to array and sort by date
    return Object.values(groupedByDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item) => ({
        date: item.date,
        wetWaste: Math.round(item.wetWaste / 100), // Scale down for readability
        dryWaste: Math.round(item.dryWaste / 100),
        sanitaryWaste: Math.round(item.sanitaryWaste / 10), // Scale down more for sanitary
      }))
  }, [data])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  const chartConfig = {
    wetWaste: {
      label: "Wet Waste",
      color: "hsl(var(--chart-1))",
    },
    dryWaste: {
      label: "Dry Waste",
      color: "hsl(var(--chart-2))",
    },
    sanitaryWaste: {
      label: "Sanitary Waste",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Waste Collection Trends</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Waste collection data across gram panchayats
          </span>
          <span className="@[540px]/card:hidden">Waste collection data</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillWetWaste" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-wetWaste)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-wetWaste)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillDryWaste" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-dryWaste)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-dryWaste)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillSanitaryWaste" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-sanitaryWaste)"
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-sanitaryWaste)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="wetWaste"
              type="natural"
              fill="url(#fillWetWaste)"
              stroke="var(--color-wetWaste)"
              stackId="a"
            />
            <Area
              dataKey="dryWaste"
              type="natural"
              fill="url(#fillDryWaste)"
              stroke="var(--color-dryWaste)"
              stackId="a"
            />
            <Area
              dataKey="sanitaryWaste"
              type="natural"
              fill="url(#fillSanitaryWaste)"
              stroke="var(--color-sanitaryWaste)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
