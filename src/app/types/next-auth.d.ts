// src/app/types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

// NextAuth의 Session, User, JWT 타입 확장
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      login?: string;     // GitHub username
      isAdmin?: boolean;  // 관리자 여부
    };
  }
  interface User extends DefaultUser {
    login?: string;
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    login?: string;
    isAdmin?: boolean;
  }
}