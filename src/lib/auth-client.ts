import type { auth } from "auth"
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
    //you can pass client configuration here
    plugins: [adminClient(), inferAdditionalFields<typeof auth>()],
})

export type Session = typeof authClient.$Infer.Session
