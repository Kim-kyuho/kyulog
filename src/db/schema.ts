// src/db/schema.ts
import { pgTable, text, timestamp, varchar, serial } from "drizzle-orm/pg-core";

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  date: timestamp("date").notNull(), // 작성일
  updateDate: timestamp("update_date").defaultNow(), // 수정일
  category: varchar("category", { length: 100 }),
  tags: text("tags"), // 문자열 배열 or JSON
  summary: text("summary"),
  content: text("content"),
});