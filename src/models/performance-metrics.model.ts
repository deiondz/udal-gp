import mongoose, { Schema, model, type Model, type Document, type Types } from "mongoose";

export interface IPerformanceMetrics extends Document {
    _id: Types.ObjectId;
    gramPanchayatId: Types.ObjectId;
    dateRecorded: Date;
    wetWaste: number; // in kg
    dryWaste: number; // in kg
    sanitaryWaste: number; // in kg
    revenue: number; // in ₹
    complianceScore: number; // percentage
    lastUpdated: Date;
}

const performanceMetricsSchema = new Schema<IPerformanceMetrics>(
    {
        gramPanchayatId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "GramPanchayat",
            index: true,
        },
        dateRecorded: {
            type: Date,
            required: true,
            default: Date.now,
            index: true,
        },
        wetWaste: {
            type: Number,
            required: true,
        },
        dryWaste: {
            type: Number,
            required: true,
        },
        sanitaryWaste: {
            type: Number,
            required: true,
        },
        revenue: {
            type: Number,
            required: true,
        },
        complianceScore: {
            type: Number,
            required: true,
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    {
        collection: "performance_metrics",
        timestamps: false,
    },
);

// Compound index for efficient queries by gramPanchayatId and dateRecorded
performanceMetricsSchema.index({ gramPanchayatId: 1, dateRecorded: -1 });

export const PerformanceMetrics: Model<IPerformanceMetrics> =
    (mongoose.models.PerformanceMetrics as Model<IPerformanceMetrics>) ||
    model<IPerformanceMetrics>("PerformanceMetrics", performanceMetricsSchema);

export type PerformanceMetricsDocument = IPerformanceMetrics;

