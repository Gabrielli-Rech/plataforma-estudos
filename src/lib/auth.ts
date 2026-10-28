// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "E-mail", type: "email" },
                password: { label: "Senha", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Preencha o e-mail e a senha.");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error("Utilizador não encontrado.");
                }

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

                if (!isValid) {
                    throw new Error("Senha incorreta.");
                }

                return {
                    id: String(user.id),
                    name: user.name,
                    email: user.email,
                    username: user.username,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = (user as any).username;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = Number(token.id);
                (session.user as any).username = token.username;
            }
            return session;
        },
    },
    secret: process.env.AUTH_SECRET,
};