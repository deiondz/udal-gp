"use client"

import { useState } from "react"
import { useIsMobile } from "~/hooks/use-mobile"
import { Button } from "~/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs"
import { IconPlus } from "@tabler/icons-react"
import { createGramPanchayat } from "../actions"
import { toast } from "sonner"

interface AddGramPanchayatDialogProps {
  onSuccess?: () => void
}

export function AddGramPanchayatDialog({
  onSuccess,
}: AddGramPanchayatDialogProps) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const mrfUnitId = formData.get("mrfUnitId") as string | null
    const mrfMapped = mrfUnitId !== null && mrfUnitId !== "" && mrfUnitId !== "none"

    // Map MRF ID to name
    const mrfUnitMap: Record<string, string> = {
      "MRF-001": "Anjanapura MRF Unit",
      "MRF-002": "Chikkaballapura MRF Unit",
      "MRF-003": "Hosakote MRF Unit",
      "MRF-004": "Kanakapura MRF Unit",
      "MRF-005": "Nelamangala MRF Unit",
      "MRF-006": "Ramanagara MRF Unit",
      "MRF-007": "Devanahalli MRF Unit",
      "MRF-008": "Hoskote MRF Unit",
      "MRF-009": "Kolar MRF Unit",
      "MRF-010": "Chintamani MRF Unit",
    }

    const newGP = {
      name: formData.get("name") as string,
      taluk: formData.get("taluk") as string,
      village: formData.get("village") as string,
      sarpanch: formData.get("sarpanch") as string,
      status: formData.get("status") as "Active" | "Inactive",
      mrfUnitId: mrfMapped && mrfUnitId ? mrfUnitId : null,
      mrfUnitName: mrfMapped && mrfUnitId ? mrfUnitMap[mrfUnitId] ?? null : null,
      mrfMapped,
      households: Number(formData.get("households")),
      shops: Number(formData.get("shops")),
      institutions: Number(formData.get("institutions")),
      swmSheds: Number(formData.get("swmSheds")),
      wetWaste: Number(formData.get("wetWaste")),
      dryWaste: Number(formData.get("dryWaste")),
      sanitaryWaste: Number(formData.get("sanitaryWaste")),
      revenue: Number(formData.get("revenue")),
      complianceScore: Number(formData.get("complianceScore")),
    }

    try {
      await createGramPanchayat(newGP)
      toast.success("Gram Panchayat created successfully")
      setIsOpen(false)
      // Reset form
      event.currentTarget.reset()
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to create Gram Panchayat")
    } finally {
      setIsSubmitting(false)
    }
  }

  const triggerButton = (
    <Button variant="outline" size="sm">
      <IconPlus />
      <span className="hidden lg:inline">Add Gram Panchayat</span>
      <span className="lg:hidden">Add</span>
    </Button>
  )

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent >
        <DrawerHeader className="gap-1">
          <DrawerTitle>Add New Gram Panchayat</DrawerTitle>
          <DrawerDescription>
            Create a new Gram Panchayat entry with basic information and performance metrics
          </DrawerDescription>
        </DrawerHeader>
        <form id="add-gram-panchayat-form" onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Tabs defaultValue="basic-info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
              <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="basic-info" className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="new-name">Name</Label>
                <Input
                  id="new-name"
                  name="name"
                  required
                  placeholder="Enter Gram Panchayat name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="new-taluk">Taluk</Label>
                  <Input
                    id="new-taluk"
                    name="taluk"
                    required
                    placeholder="Enter Taluk name"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="new-village">Village</Label>
                  <Input
                    id="new-village"
                    name="village"
                    required
                    placeholder="Enter Village name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="new-sarpanch">Sarpanch</Label>
                  <Input
                    id="new-sarpanch"
                    name="sarpanch"
                    required
                    placeholder="Enter Sarpanch name"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="new-status">Status</Label>
                  <Select name="status" defaultValue="Active">
                    <SelectTrigger id="new-status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-3">
                <Label htmlFor="new-mrfUnitId">MRF Unit</Label>
                <Select name="mrfUnitId" defaultValue="none">
                  <SelectTrigger id="new-mrfUnitId" className="w-full">
                    <SelectValue placeholder="Select MRF Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not Mapped</SelectItem>
                    <SelectItem value="MRF-001">MRF-001 - Anjanapura MRF Unit</SelectItem>
                    <SelectItem value="MRF-002">MRF-002 - Chikkaballapura MRF Unit</SelectItem>
                    <SelectItem value="MRF-003">MRF-003 - Hosakote MRF Unit</SelectItem>
                    <SelectItem value="MRF-004">MRF-004 - Kanakapura MRF Unit</SelectItem>
                    <SelectItem value="MRF-005">MRF-005 - Nelamangala MRF Unit</SelectItem>
                    <SelectItem value="MRF-006">MRF-006 - Ramanagara MRF Unit</SelectItem>
                    <SelectItem value="MRF-007">MRF-007 - Devanahalli MRF Unit</SelectItem>
                    <SelectItem value="MRF-008">MRF-008 - Hoskote MRF Unit</SelectItem>
                    <SelectItem value="MRF-009">MRF-009 - Kolar MRF Unit</SelectItem>
                    <SelectItem value="MRF-010">MRF-010 - Chintamani MRF Unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="flex flex-col gap-4 mt-4">
              <div className="text-muted-foreground mb-2 text-sm">
                Performance metrics are generated by the Gram Panchayat and will start at 0. They cannot be set during creation.
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="new-households">Households</Label>
                  <Input
                    id="new-households"
                    name="households"
                    type="number"
                    defaultValue={0}
                    disabled
                    className="bg-muted"
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="new-shops">Shops</Label>
                  <Input
                    id="new-shops"
                    name="shops"
                    type="number"
                    defaultValue={0}
                    disabled
                    className="bg-muted"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="new-institutions">Institutions</Label>
                  <Input
                    id="new-institutions"
                    name="institutions"
                    type="number"
                    defaultValue={0}
                    disabled
                    className="bg-muted"
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="new-swmSheds">SWM Sheds</Label>
                  <Input
                    id="new-swmSheds"
                    name="swmSheds"
                    type="number"
                    defaultValue={0}
                    disabled
                    className="bg-muted"
                    readOnly
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="new-wetWaste">Wet Waste (kg)</Label>
                  <Input
                    id="new-wetWaste"
                    name="wetWaste"
                    type="number"
                    defaultValue={0}
                    disabled
                    className="bg-muted"
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="new-dryWaste">Dry Waste (kg)</Label>
                  <Input
                    id="new-dryWaste"
                    name="dryWaste"
                    type="number"
                    defaultValue={0}
                    disabled
                    className="bg-muted"
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="new-sanitaryWaste">Sanitary Waste (kg)</Label>
                  <Input
                    id="new-sanitaryWaste"
                    name="sanitaryWaste"
                    type="number"
                    defaultValue={0}
                    disabled
                    className="bg-muted"
                    readOnly
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="new-revenue">Revenue (₹)</Label>
                  <Input
                    id="new-revenue"
                    name="revenue"
                    type="number"
                    defaultValue={0}
                    disabled
                    className="bg-muted"
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="new-complianceScore">Compliance Score (%)</Label>
                  <Input
                    id="new-complianceScore"
                    name="complianceScore"
                    type="number"
                    defaultValue={0}
                    disabled
                    className="bg-muted"
                    readOnly
                    min={0}
                    max={100}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </form>
        <DrawerFooter>
          <Button
            type="submit"
            form="add-gram-panchayat-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

