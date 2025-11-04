import { z } from "zod"

// Gram Panchayat Schema
export const gramPanchayatSchema = z.object({
  id: z.string(), // MongoDB _id as string
  name: z.string(),
  taluk: z.string(),
  village: z.string(),
  sarpanch: z.string(),
  status: z.enum(["Active", "Inactive"]),
  mrfMapped: z.boolean(),
  mrfUnitId: z.string().nullable().optional(),
  mrfUnitName: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  dateCreated: z.string().or(z.date()),
  households: z.number(),
  shops: z.number(),
  institutions: z.number(),
  swmSheds: z.number(),
})

export type GramPanchayat = z.infer<typeof gramPanchayatSchema>

// Performance Metrics Schema
export const performanceMetricsSchema = z.object({
  id: z.string(), // MongoDB _id as string
  gramPanchayatId: z.string(), // MongoDB ObjectId as string
  dateRecorded: z.string().or(z.date()),
  wetWaste: z.number(), // in kg
  dryWaste: z.number(), // in kg
  sanitaryWaste: z.number(), // in kg
  revenue: z.number(), // in ₹
  complianceScore: z.number(), // percentage
  lastUpdated: z.string().or(z.date()),
})

export type PerformanceMetrics = z.infer<typeof performanceMetricsSchema>

// MRF Schema
export const mrfSchema = z.object({
  id: z.string(), // MongoDB _id as string
  unitId: z.string().nullable().optional(),
  name: z.string(),
  status: z.enum(["Active", "Inactive", "Under Maintenance"]).nullable().optional(),
  dateCreated: z.string().or(z.date()).optional(),
  taluk: z.string().nullable().optional(),
  village: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  contactPerson: z.string().nullable().optional(),
  capacity: z.number().nullable().optional(),
  operationalStatus: z.string().nullable().optional(),
  equipment: z.string().nullable().optional(),
})

export type MRF = z.infer<typeof mrfSchema>

// Create/Update Request Types
export type CreateGramPanchayatRequest = {
  email: string
  password: string
  data: Omit<GramPanchayat, "id" | "dateCreated">
}

export type CreatePerformanceMetricsRequest = {
  gramPanchayatId: string
  data: Omit<PerformanceMetrics, "id" | "gramPanchayatId" | "dateRecorded" | "lastUpdated">
}

export type CreateMRFRequest = {
  data: Omit<MRF, "id" | "dateCreated">
}

