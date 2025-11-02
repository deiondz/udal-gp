"use server"

import { gramPanchayatSchema, type GramPanchayat } from "./schema"
import data from "~/app/dashboard/gram-panchayats/data.json"

export async function getGramPanchayats(): Promise<GramPanchayat[]> {
  // Validate data against schema
  const validated = data.map((item) => gramPanchayatSchema.parse(item))
  return validated
}

export async function getGramPanchayatById(
  id: number,
): Promise<GramPanchayat | null> {
  const item = data.find((gp) => gp.id === id)
  if (!item) return null
  return gramPanchayatSchema.parse(item)
}

export async function createGramPanchayat(
  request: { email: string; password: string; data: Omit<GramPanchayat, "id" | "dateCreated" | "lastUpdated"> },
): Promise<GramPanchayat> {
  // In a real implementation, this would save to database
  const newId = Math.max(...data.map((gp) => gp.id)) + 1
  const now = new Date().toISOString().split("T")[0] ?? new Date().toISOString().slice(0, 10)

  const newGP: GramPanchayat = {
    ...request.data,
    id: newId,
    dateCreated: now,
    lastUpdated: now,
  }

  return gramPanchayatSchema.parse(newGP)
}

export async function updateGramPanchayat(
  id: number,
  updates: Partial<Omit<GramPanchayat, "id" | "dateCreated">>,
): Promise<GramPanchayat | null> {
  const item = data.find((gp) => gp.id === id)
  if (!item) return null

  const updated = {
    ...item,
    ...updates,
    lastUpdated: new Date().toISOString().split("T")[0] ?? new Date().toISOString().slice(0, 10),
  }

  return gramPanchayatSchema.parse(updated)
}

export async function deleteGramPanchayat(id: number): Promise<boolean> {
  const index = data.findIndex((gp) => gp.id === id)
  if (index === -1) return false

  // In a real implementation, this would delete from database
  return true
}

export async function mapMRF(
  gpId: number,
  mrfId: string,
  mrfName: string,
): Promise<GramPanchayat | null> {
  const item = data.find((gp) => gp.id === gpId)
  if (!item) return null

  const updated = {
    ...item,
    mrfMapped: true,
    mrfUnitId: mrfId,
    mrfUnitName: mrfName,
    lastUpdated: new Date().toISOString().split("T")[0] ?? new Date().toISOString().slice(0, 10),
  }

  return gramPanchayatSchema.parse(updated)
}

export async function unmapMRF(gpId: number): Promise<GramPanchayat | null> {
  const item = data.find((gp) => gp.id === gpId)
  if (!item) return null

  const updated = {
    ...item,
    mrfMapped: false,
    mrfUnitId: null,
    mrfUnitName: null,
    lastUpdated: new Date().toISOString().split("T")[0] ?? new Date().toISOString().slice(0, 10),
  }

  return gramPanchayatSchema.parse(updated)
}

