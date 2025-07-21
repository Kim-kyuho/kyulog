import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { db } from '../src/db/index';
import { blogPosts } from '../src/db/schema';
import dotenv from 'dotenv';

dotenv.config();

async function migrateMarkdownToDB() {
  const postsDir = path.join(process.cwd(), 'posts');
  const files = await fs.readdir(postsDir);

  /*
  for (const file of files) {
    if (path.extname(file) !== '.md') continue;

    const filePath = path.join(postsDir, file);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    if (!data.title || !data.date || !data.id) {
      console.warn(`Skipping ${file} due to missing required fields`);
      continue;
    }

    try {
      await db.insert(blogPosts).values({
        title: data.title,
        summary: data.summary ?? '',
        date: new Date(data.date),
        updateDate: new Date(data.date),
        category: data.category ?? null,
        tags: data.tags ?? [],
        content,
      });
      console.log(`✅ Inserted: ${data.id}`);
    } catch (err) {
      console.error(`❌ Failed to insert ${data.id}:`, err);
    }
  }
  */

  const mdFiles = files
    .filter((file) => path.extname(file) === '.md')
    .map(async (file) => {
      const filePath = path.join(postsDir, file);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const { data, content } = matter(fileContent);
      return { file, data, content };
    });

  const resolvedPosts = await Promise.all(mdFiles);

  // 필수 항목이 있는 것만 필터링하고 날짜순 정렬
  const sortedPosts = resolvedPosts
    .filter(({ data }) => data.title && data.date)
    .sort((a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime());

  for (const { file, data, content } of sortedPosts) {
    try {
      await db.insert(blogPosts).values({
        title: data.title,
        summary: data.summary ?? '',
        date: new Date(data.date),
        updateDate: new Date(data.date),
        category: data.category ?? null,
        tags: data.tags ?? [],
        content,
      });
      console.log(`✅ Inserted: ${data.title}`);
    } catch (err) {
      console.error(`❌ Failed to insert ${data.title}:`, err);
    }
  }
}

migrateMarkdownToDB();