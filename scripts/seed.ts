// Ensure NODE_ENV is set before importing env-dependent modules
// Use Object.assign to bypass readonly restriction
if (!process.env.NODE_ENV) {
    Object.assign(process.env, { NODE_ENV: "development" });
}

import { seedDatabase } from "../src/lib/seed";
import mongoose from "mongoose";

/**
 * Standalone script to seed the database
 * Run with: bun run scripts/seed.ts or tsx scripts/seed.ts
 */
async function main() {
    try {
        await seedDatabase();
        process.exit(0);
    } catch (error) {
        console.error("Failed to seed database:", error);
        process.exit(1);
    } finally {
        // Close Mongoose connection
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log("🔌 Database connection closed");
        }
    }
}

main();

