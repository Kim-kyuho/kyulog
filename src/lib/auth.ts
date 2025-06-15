// File: src/app/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
    providers: [
        GitHubProvider({
                clientId: process.env.GITHUB_ID!,
                clientSecret: process.env.GITHUB_SECRET!,
            profile(profile) {
                return {
                    id: profile.id.toString(),
                    name: profile.name ?? profile.login,
                    email: profile.email ?? "",
                    image: profile.avatar_url ?? "",
                    login: profile.login,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user && "login" in user) {
                token.login = user.login;
                token.isAdmin = user.login === "Kim-kyuho";
            }
            return token;
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                ...session.user,
                login: token.login as string,
                isAdmin: token.isAdmin as boolean,
                },
            };
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};