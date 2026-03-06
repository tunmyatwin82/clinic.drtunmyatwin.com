import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"

const handler = NextAuth({
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

                const { emailOrPhone, password } = credentials as { emailOrPhone: string; password: string }

                // Check if input is email or phone
                const isEmail = emailOrPhone.includes("@")
                let user: any = null

                if (isEmail) {
                    user = await db.users.getByEmail(emailOrPhone)
                } else {
                    user = await db.users.getByPhone(emailOrPhone)
                }

                if (!user) {
                    return null
                }

                // In a real application, you should verify the password hash
                if (credentials.password !== "demo123") {
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
}) as unknown as any;

export { handler as GET, handler as POST }
