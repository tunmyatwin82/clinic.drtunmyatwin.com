import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db, type User as DbUser } from "@/lib/db"

export const { handlers: { GET, POST } } = NextAuth({
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                emailOrPhone: { label: "Email or Phone", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.emailOrPhone || !credentials?.password) {
                    return null
                }

                const { emailOrPhone } = credentials as { emailOrPhone: string; password: string }

                const isEmail = emailOrPhone.includes("@")
                let user: DbUser | null = null

                if (isEmail) {
                    user = await db.users.getByEmail(emailOrPhone)
                } else {
                    user = await db.users.getByPhone(emailOrPhone)
                }

                if (!user) {
                    return null
                }

                if (credentials.password !== user.password_hash) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    role: user.role,
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.phone = user.phone
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.phone = token.phone as string
            }
            return session
        }
    },
    pages: {
        signIn: "/login"
    },
    session: {
        strategy: "jwt"
    }
})
