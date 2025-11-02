import { z } from "zod"

export const gramPanchayatSchema = z.object({
  id: z.number(),
  name: z.string(),
  taluk: z.string(),
  village: z.string(),
  sarpanch: z.string(),
  status: z.enum(["Active", "Inactive"]),
  mrfMapped: z.boolean(),
  mrfUnitId: z.string().nullable(),
  mrfUnitName: z.string().nullable(),
  dateCreated: z.string(),
  // Performance metrics
  households: z.number(),
  shops: z.number(),
  institutions: z.number(),
  swmSheds: z.number(),
  wetWaste: z.number(), // in kg
  dryWaste: z.number(), // in kg
  sanitaryWaste: z.number(), // in kg
  revenue: z.number(), // in ₹
  complianceScore: z.number(), // percentage
  lastUpdated: z.string(),
})

export type GramPanchayat = z.infer<typeof gramPanchayatSchema>

