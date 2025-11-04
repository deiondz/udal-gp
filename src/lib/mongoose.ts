import mongoose from "mongoose";
import { env } from "~/env";

const uri = env.MONGODB_URI;
const dbName = env.MONGODB_DB;

const globalForMongoose = globalThis as unknown as {
    mongoosePromise?: Promise<typeof mongoose>;
};

function createMongoosePromise(): Promise<typeof mongoose> {
    return mongoose.connect(uri, {
        dbName,
    });
}

export async function connectMongoose(): Promise<typeof mongoose> {
    if (!globalForMongoose.mongoosePromise) {
        globalForMongoose.mongoosePromise = createMongoosePromise();
    }
    return globalForMongoose.mongoosePromise;
}

export async function getMongooseConnection(): Promise<typeof mongoose> {
    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }
    return connectMongoose();
}

