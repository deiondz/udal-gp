import { readFileSync } from "node:fs";
import { join } from "node:path";
import { connectMongoose } from "./mongoose";
import { GramPanchayat, PerformanceMetrics } from "~/models";
import type { Types } from "mongoose";

interface JsonGramPanchayatData {
    id: number;
    name: string;
    taluk: string;
    village: string;
    sarpanch: string;
    status: "Active" | "Inactive";
    mrfMapped: boolean;
    mrfUnitId: string | null;
    mrfUnitName: string | null;
    dateCreated: string;
    households: number;
    shops: number;
    institutions: number;
    swmSheds: number;
    wetWaste: number;
    dryWaste: number;
    sanitaryWaste: number;
    revenue: number;
    complianceScore: number;
    lastUpdated: string;
}

/**
 * Converts a date string (YYYY-MM-DD) to a Date object
 */
function parseDate(dateString: string): Date {
    return new Date(dateString);
}

/**
 * Seeds the database with gram panchayat and performance metrics data from JSON
 */
export async function seedDatabase(): Promise<void> {
    try {
        console.log("🌱 Starting database seeding...");

        // Connect to MongoDB
        console.log("📡 Connecting to MongoDB...");
        await connectMongoose();
        console.log("✅ Connected to MongoDB");

        // Read and parse JSON file
        const dataPath = join(
            process.cwd(),
            "src/app/dashboard/gram-panchayats/data.json",
        );
        console.log(`📂 Reading data from: ${dataPath}`);
        const jsonData = readFileSync(dataPath, "utf-8");
        const data: JsonGramPanchayatData[] = JSON.parse(jsonData);
        console.log(`📊 Found ${data.length} records to seed`);

        // Check if data already exists
        const existingGramPanchayats = await GramPanchayat.countDocuments();
        if (existingGramPanchayats > 0) {
            console.log(
                `⚠️  Warning: Found ${existingGramPanchayats} existing gram panchayats in database.`,
            );
            console.log("   Clearing existing data before seeding...");
            await GramPanchayat.deleteMany({});
            await PerformanceMetrics.deleteMany({});
            console.log("✅ Cleared existing data");
        }

        // Process each record
        const gramPanchayatIds: Map<number, Types.ObjectId> = new Map();
        const gramPanchayatsToInsert: Array<{
            name: string;
            taluk: string;
            village: string;
            sarpanch: string;
            status: "Active" | "Inactive";
            mrfMapped: boolean;
            mrfUnitId: string | null;
            mrfUnitName: string | null;
            dateCreated: Date;
            households: number;
            shops: number;
            institutions: number;
            swmSheds: number;
        }> = [];

        const performanceMetricsToInsert: Array<{
            gramPanchayatId: Types.ObjectId;
            dateRecorded: Date;
            wetWaste: number;
            dryWaste: number;
            sanitaryWaste: number;
            revenue: number;
            complianceScore: number;
            lastUpdated: Date;
        }> = [];

        console.log("🔄 Processing records...");
        for (const record of data) {
            // Prepare gram panchayat data
            gramPanchayatsToInsert.push({
                name: record.name,
                taluk: record.taluk,
                village: record.village,
                sarpanch: record.sarpanch,
                status: record.status,
                mrfMapped: record.mrfMapped,
                mrfUnitId: record.mrfUnitId,
                mrfUnitName: record.mrfUnitName,
                dateCreated: parseDate(record.dateCreated),
                households: record.households,
                shops: record.shops,
                institutions: record.institutions,
                swmSheds: record.swmSheds,
            });

            // Store the original id to map to the generated _id later
            // We'll use the index to map after insertion
        }

        // Insert gram panchayats
        console.log(`📝 Inserting ${gramPanchayatsToInsert.length} gram panchayats...`);
        const insertedGramPanchayats = await GramPanchayat.insertMany(
            gramPanchayatsToInsert,
        );
        console.log(`✅ Inserted ${insertedGramPanchayats.length} gram panchayats`);

        // Verify all documents were inserted
        if (insertedGramPanchayats.length !== data.length) {
            throw new Error(
                `Mismatch: Expected ${data.length} gram panchayats, but only ${insertedGramPanchayats.length} were inserted`,
            );
        }

        // Map original JSON id/index to MongoDB _id
        for (let i = 0; i < data.length; i++) {
            const insertedDoc = insertedGramPanchayats[i];
            if (!insertedDoc?._id) {
                throw new Error(
                    `Failed to get _id for gram panchayat at index ${i} (${data[i]?.name})`,
                );
            }
            gramPanchayatIds.set(data[i]?.id ?? 0, insertedDoc._id as Types.ObjectId);
        }

        // Prepare performance metrics data
        console.log("🔄 Preparing performance metrics...");
        for (const record of data) {
            const gramPanchayatId = gramPanchayatIds.get(record.id);
            if (!gramPanchayatId) {
                console.warn(
                    `⚠️  Warning: Could not find gram panchayat ID for record ${record.id} (${record.name})`,
                );
                continue;
            }

            performanceMetricsToInsert.push({
                gramPanchayatId,
                dateRecorded: parseDate(record.lastUpdated), // Use lastUpdated as dateRecorded
                wetWaste: record.wetWaste,
                dryWaste: record.dryWaste,
                sanitaryWaste: record.sanitaryWaste,
                revenue: record.revenue,
                complianceScore: record.complianceScore,
                lastUpdated: parseDate(record.lastUpdated),
            });
        }

        // Insert performance metrics
        console.log(
            `📝 Inserting ${performanceMetricsToInsert.length} performance metrics...`,
        );
        const insertedMetrics = await PerformanceMetrics.insertMany(
            performanceMetricsToInsert,
        );
        console.log(`✅ Inserted ${insertedMetrics.length} performance metrics`);

        console.log("🎉 Database seeding completed successfully!");
        console.log(
            `   - Gram Panchayats: ${insertedGramPanchayats.length}`,
        );
        console.log(`   - Performance Metrics: ${insertedMetrics.length}`);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        throw error;
    }
}

