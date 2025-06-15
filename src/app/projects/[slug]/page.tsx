// src/app/projects/[slug]/page.tsx

import { notFound } from 'next/navigation';
import projectData from '@/data/projects.json';
import Image from 'next/image';

export async function generateStaticParams() {
  return projectData.map((project) => ({ slug: project.slug }));
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectData.find((p) => p.slug === slug);

  if (!project) return notFound();

  return (
    <div className="max-w-screen-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
      <Image
        src={project.image}
        alt={project.title}
        width={800}
        height={400}
        className="mb-6 rounded shadow"
      />
      <p className="text-lg mb-4 text-gray-800 dark:text-gray-100 whitespace-pre-line">{project.details}</p>
      <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300">
        {project.techStack?.map((tech) => (
          <span
            key={tech}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-200 border"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
