// src/components/Header.tsx
'use client';

import Link from "next/link";

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 sm:px-8 border-b border-gray-200 dark:border-gray-700">
      <h1 className="text-xl font-bold text-foreground">
        <Link href="/">Kyuho</Link>
      </h1>
      <nav className="space-x-4 text-sm sm:text-base">
        <Link href="/about" className="hover:underline">About</Link>
        <Link href="/projects" className="hover:underline">Projects</Link>
        <Link href="/blog" className="hover:underline">Blog</Link>
        <Link href="/contact" className="hover:underline">Contact</Link>
      </nav>
    </header>
  );
}