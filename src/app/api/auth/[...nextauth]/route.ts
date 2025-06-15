// File: src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";

// NextAuth handler for App Router API route
const handler = NextAuth(authOptions);

// Export GET and POST according to Next.js Route Handler requirements
export { handler as GET, handler as POST };