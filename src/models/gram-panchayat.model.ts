import mongoose, { Schema, model, type Model, type Document, type Types } from "mongoose";

export interface IGramPanchayat extends Document {
    _id: Types.ObjectId;
    name: string;
    taluk: string;
    village: string;
    sarpanch: string;
    status: "Active" | "Inactive";
    mrfMapped: boolean;
    mrfUnitId?: string | null;
    mrfUnitName?: string | null;
    userId?: string | null;
    dateCreated: Date;
    households: number;
    shops: number;
    institutions: number;
    swmSheds: number;
}

const gramPanchayatSchema = new Schema<IGramPanchayat>(
    {
        name: {
            type: String,
            required: true,
        },
        taluk: {
            type: String,
            required: true,
        },
        village: {
            type: String,
            required: true,
        },
        sarpanch: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            required: true,
        },
        mrfMapped: {
            type: Boolean,
            default: false,
        },
        mrfUnitId: {
            type: String,
            default: null,
        },
        mrfUnitName: {
            type: String,
            default: null,
        },
        userId: {
            type: String,
            default: null,
        },
        dateCreated: {
            type: Date,
            default: Date.now,
        },
        households: {
            type: Number,
            required: true,
        },
        shops: {
            type: Number,
            required: true,
        },
        institutions: {
            type: Number,
            required: true,
        },
        swmSheds: {
            type: Number,
            required: true,
        },
    },
    {
        collection: "gram_panchayats",
        timestamps: false,
    },
);

export const GramPanchayat: Model<IGramPanchayat> =
    (mongoose.models.GramPanchayat as Model<IGramPanchayat>) ||
    model<IGramPanchayat>("GramPanchayat", gramPanchayatSchema);

export type GramPanchayatDocument = IGramPanchayat;

