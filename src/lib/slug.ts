// src/lib/slug.ts
import slugify from "slugify";

export function toSlug(text: string) {
  return slugify(text, { lower: true });
}

export function fromSlug(slug: string, all: string[]) {
  return all.find((t) => toSlug(t) === slug);
}