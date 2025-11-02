import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "~/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

type PanchayatData = {
  id: number
  name: string
  status: string
  revenue: number
  households: number
  complianceScore: number
  wetWaste: number
  dryWaste: number
  sanitaryWaste: number
  lastUpdated: string
}

export function SectionCards({ data }: { data: PanchayatData[] }) {
  // Calculate metrics
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const totalHouseholds = data.reduce((sum, item) => sum + item.households, 0)
  const activePanchayats = data.filter((item) => item.status === "Active").length
  const avgComplianceScore =
    data.reduce((sum, item) => sum + item.complianceScore, 0) / data.length

  // Calculate percentage changes (mock data for demonstration)
  const revenueChange = 12.5 // This could be calculated from historical data
  const householdsChange = 8.3
  const activeChange = 5.0
  const complianceChange = 2.1

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN")}`
  }

  const formatNumber = (value: number) => {
    return value.toLocaleString("en-IN")
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(totalRevenue)}
          </CardTitle>
         
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Revenue from all panchayats <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Across {data.length} gram panchayats
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Households</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(totalHouseholds)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconTrendingUp className="size-3" />
              +{householdsChange}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Growing household coverage <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Serving communities across region
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Panchayats</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activePanchayats}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconTrendingUp className="size-3" />
              +{activeChange}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Operational panchayats <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Out of {data.length} total panchayats
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Avg Compliance Score</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatPercentage(avgComplianceScore)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconTrendingUp className="size-3" />
              +{complianceChange}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Compliance improving steadily <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Average across all panchayats
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
