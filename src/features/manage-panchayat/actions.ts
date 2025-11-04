"use server"

import { Types } from "mongoose"
import { getGramPanchayatsCollection, type GramPanchayatDocument } from "~/models"
import { gramPanchayatSchema, type GramPanchayat } from "./schema"
import { auth } from "auth"
import { headers } from "next/headers"

// Helper function to convert MongoDB document to frontend format
function toGramPanchayatFormat(doc: {
  _id: { toString(): string }
  name: string
  taluk: string
  village: string
  sarpanch: string
  status: "Active" | "Inactive"
  mrfMapped?: boolean
  mrfUnitId?: string | null
  mrfUnitName?: string | null
  userId?: string | null
  dateCreated?: Date
  households: number
  shops: number
  institutions: number
  swmSheds: number
}): GramPanchayat {
  return {
    id: doc._id.toString(),
    name: doc.name,
    taluk: doc.taluk,
    village: doc.village,
    sarpanch: doc.sarpanch,
    status: doc.status,
    mrfMapped: doc.mrfMapped ?? false,
    mrfUnitId: doc.mrfUnitId ?? null,
    mrfUnitName: doc.mrfUnitName ?? null,
    userId: doc.userId ?? null,
    dateCreated: doc.dateCreated?.toISOString() ?? new Date().toISOString(),
    households: doc.households,
    shops: doc.shops,
    institutions: doc.institutions,
    swmSheds: doc.swmSheds,
  }
}

export async function getGramPanchayats(): Promise<GramPanchayat[]> {
  const GramPanchayat = await getGramPanchayatsCollection()
  const docs = await GramPanchayat.find({}).lean()
  return docs.map(toGramPanchayatFormat)
}

export async function getGramPanchayatById(
  id: string,
): Promise<GramPanchayat | null> {
  if (!Types.ObjectId.isValid(id)) {
    return null
  }

  const GramPanchayat = await getGramPanchayatsCollection()
  const doc = await GramPanchayat.findById(id).lean()
  if (!doc) return null

  return toGramPanchayatFormat(doc)
}

export async function createGramPanchayat(
  request: { email: string; password: string; data: Omit<GramPanchayat, "id" | "dateCreated"> },
): Promise<GramPanchayat> {
  const GramPanchayat = await getGramPanchayatsCollection()

  try {
    // Check if a GP with the same name and taluk already exists
    const existing = await GramPanchayat.findOne({
      name: request.data.name,
      taluk: request.data.taluk,
    }).lean()

    if (existing) {
      throw new Error(
        `Gram Panchayat with name "${request.data.name}" already exists in taluk "${request.data.taluk}"`
      )
    }

    // Create the user account
    let userResult: { user?: { id: string } } | undefined
    try {
      userResult = await auth.api.createUser({
        body: {
          email: request.email,
          password: request.password,
          name: request.data.name,
        },
        headers: await headers(),
      })
    } catch (authError: unknown) {
      // Handle duplicate email errors
      if (authError instanceof Error) {
        const errorMessage = authError.message.toLowerCase()
        if (
          errorMessage.includes("email") &&
          (errorMessage.includes("already exists") ||
            errorMessage.includes("already in use") ||
            errorMessage.includes("duplicate") ||
            errorMessage.includes("unique"))
        ) {
          throw new Error(`A user with email "${request.email}" already exists. Please use a different email address.`)
        }
        // Re-throw other auth errors
        throw authError
      }
      throw new Error("Failed to create user account")
    }

    if (!userResult?.user) {
      throw new Error("Failed to create user account")
    }

    // Extract userId from the created user account
    const userId = userResult.user.id
    if (!userId) {
      throw new Error("Failed to create user account: user ID is missing")
    }

    // Create the gram panchayat document
    const newDoc = await GramPanchayat.create({
      name: request.data.name,
      taluk: request.data.taluk,
      village: request.data.village,
      sarpanch: request.data.sarpanch,
      status: request.data.status,
      mrfMapped: request.data.mrfMapped ?? false,
      mrfUnitId: request.data.mrfUnitId ?? null,
      mrfUnitName: request.data.mrfUnitName ?? null,
      userId: userId,
      households: 0,
      shops: 0,
      institutions: 0,
      swmSheds: 0,
    })

    const saved = await newDoc.save()
    return toGramPanchayatFormat(saved)
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error("An unexpected error occurred while creating gram panchayat")
  }
}

export async function updateGramPanchayat(
  id: string,
  updates: Partial<Omit<GramPanchayat, "id" | "dateCreated">>,
): Promise<GramPanchayat | null> {
  if (!Types.ObjectId.isValid(id)) {
    return null
  }

  const GramPanchayat = await getGramPanchayatsCollection()
  const doc = await GramPanchayat.findByIdAndUpdate(
    id,
    {
      ...(updates.name && { name: updates.name }),
      ...(updates.taluk && { taluk: updates.taluk }),
      ...(updates.village && { village: updates.village }),
      ...(updates.sarpanch && { sarpanch: updates.sarpanch }),
      ...(updates.status && { status: updates.status }),
      ...(updates.mrfMapped !== undefined && { mrfMapped: updates.mrfMapped }),
      ...(updates.mrfUnitId !== undefined && { mrfUnitId: updates.mrfUnitId }),
      ...(updates.mrfUnitName !== undefined && { mrfUnitName: updates.mrfUnitName }),
      ...(updates.userId !== undefined && { userId: updates.userId }),
      ...(updates.households !== undefined && { households: updates.households }),
      ...(updates.shops !== undefined && { shops: updates.shops }),
      ...(updates.institutions !== undefined && { institutions: updates.institutions }),
      ...(updates.swmSheds !== undefined && { swmSheds: updates.swmSheds }),
    },
    { new: true }
  ).lean()

  if (!doc) return null
  return toGramPanchayatFormat(doc)
}

export async function deleteGramPanchayat(id: string): Promise<boolean> {
  if (!Types.ObjectId.isValid(id)) {
    return false
  }

  const GramPanchayat = await getGramPanchayatsCollection()
  const result = await GramPanchayat.findByIdAndDelete(id)
  return result !== null
}

export async function mapMRF(
  gpId: string,
  mrfId: string,
  mrfName: string,
): Promise<GramPanchayat | null> {
  if (!Types.ObjectId.isValid(gpId)) {
    return null
  }

  const GramPanchayat = await getGramPanchayatsCollection()
  const doc = await GramPanchayat.findByIdAndUpdate(
    gpId,
    {
      mrfMapped: true,
      mrfUnitId: mrfId,
      mrfUnitName: mrfName,
    },
    { new: true }
  ).lean()

  if (!doc) return null
  return toGramPanchayatFormat(doc)
}

export async function unmapMRF(gpId: string): Promise<GramPanchayat | null> {
  if (!Types.ObjectId.isValid(gpId)) {
    return null
  }

  const GramPanchayat = await getGramPanchayatsCollection()
  const doc = await GramPanchayat.findByIdAndUpdate(
    gpId,
    {
      mrfMapped: false,
      mrfUnitId: null,
      mrfUnitName: null,
    },
    { new: true }
  ).lean()

  if (!doc) return null
  return toGramPanchayatFormat(doc)
}

