import { connectMongoose, getMongooseConnection } from "~/lib/mongoose";
import {
    GramPanchayat,
    type IGramPanchayat,
    type GramPanchayatDocument,
} from "./gram-panchayat.model";
import {
    PerformanceMetrics,
    type IPerformanceMetrics,
    type PerformanceMetricsDocument,
} from "./performance-metrics.model";
import {
    MRF,
    type IMRF,
    type MRFDocument,
} from "./mrf.model";

// Export models
export { GramPanchayat, PerformanceMetrics, MRF };

// Export types
export type {
    IGramPanchayat,
    GramPanchayatDocument,
    IPerformanceMetrics,
    PerformanceMetricsDocument,
    IMRF,
    MRFDocument,
};

// Export connection helpers
export { connectMongoose, getMongooseConnection };

/**
 * Collection helper function to get the Gram Panchayats model
 * Ensures Mongoose connection is established before returning the model
 */
export async function getGramPanchayatsCollection(): Promise<typeof GramPanchayat> {
    await getMongooseConnection();
    return GramPanchayat;
}

/**
 * Collection helper function to get the Performance Metrics model
 * Ensures Mongoose connection is established before returning the model
 */
export async function getPerformanceMetricsCollection(): Promise<typeof PerformanceMetrics> {
    await getMongooseConnection();
    return PerformanceMetrics;
}

/**
 * Collection helper function to get the MRF model
 * Ensures Mongoose connection is established before returning the model
 */
export async function getMRFCollection(): Promise<typeof MRF> {
    await getMongooseConnection();
    return MRF;
}

