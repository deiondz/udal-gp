import { type Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/database";
const dbName = process.env.MONGODB_DB;

const globalForMongo = globalThis as unknown as {
	mongoClientPromise?: Promise<MongoClient>;
};

function createMongoClientPromise(): Promise<MongoClient> {
	const client = new MongoClient(uri);
	return client.connect();
}

export async function getMongoClient(): Promise<MongoClient> {
	if (!globalForMongo.mongoClientPromise) {
		globalForMongo.mongoClientPromise = createMongoClientPromise();
	}
	return globalForMongo.mongoClientPromise;
}

export async function getDb(): Promise<Db> {
	const client = await getMongoClient();
	return dbName ? client.db(dbName) : client.db();
}
