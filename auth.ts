import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getDb, getMongoClient } from "./src/lib/mongodb";
import { nextCookies } from "better-auth/next-js";
import { env } from "~/env";
import { admin } from "better-auth/plugins";
const client = await getMongoClient();
const db = await getDb();

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
        disableSignUp: false
    },
    secret: env.BETTER_AUTH_SECRET,
    database: mongodbAdapter(db, {
        // Optional: if you don't provide a client, database transactions won't be enabled.
        client,
    }),
    plugins: [
        nextCookies(),
        admin({
            defaultRole: 'user',
        }),
    ]
});
