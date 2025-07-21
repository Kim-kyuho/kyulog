// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",  // 실제 스키마 정의용 파일 위치
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!, // .env에서 설정한 연결 문자열
  },
});