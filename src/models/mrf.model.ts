import mongoose, { Schema, model, type Model, type Document, type Types } from "mongoose";

export interface IMRF extends Document {
    _id: Types.ObjectId;
    unitId?: string | null; // e.g., "MRF-GUR-01"
    name: string; // MRF Unit name
    status?: "Active" | "Inactive" | "Under Maintenance" | null;
    dateCreated?: Date;
    // Location fields (all optional)
    taluk?: string | null;
    village?: string | null;
    address?: string | null;
    // Contact fields (all optional)
    phone?: string | null;
    email?: string | null;
    contactPerson?: string | null;
    // Operational fields (all optional)
    capacity?: number | null; // in kg or tons
    operationalStatus?: string | null;
    equipment?: string | null;
}

const mrfSchema = new Schema<IMRF>(
    {
        unitId: {
            type: String,
            default: null,
            unique: true,
            sparse: true, // Allow multiple nulls
        },
        name: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive", "Under Maintenance"],
            default: null,
        },
        dateCreated: {
            type: Date,
            default: Date.now,
        },
        // Location fields
        taluk: {
            type: String,
            default: null,
        },
        village: {
            type: String,
            default: null,
        },
        address: {
            type: String,
            default: null,
        },
        // Contact fields
        phone: {
            type: String,
            default: null,
        },
        email: {
            type: String,
            default: null,
        },
        contactPerson: {
            type: String,
            default: null,
        },
        // Operational fields
        capacity: {
            type: Number,
            default: null,
        },
        operationalStatus: {
            type: String,
            default: null,
        },
        equipment: {
            type: String,
            default: null,
        },
    },
    {
        collection: "mrfs",
        timestamps: false,
    },
);

// Note: unitId index is automatically created by the unique: true option above
// No need for explicit index definition

export const MRF: Model<IMRF> =
    (mongoose.models.MRF as Model<IMRF>) || model<IMRF>("MRF", mrfSchema);

export type MRFDocument = IMRF;

