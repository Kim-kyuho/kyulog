// src/components/ProjectCard.tsx
import Image from "next/image";
import Link from "next/link";

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  link: string;
}


export default function ProjectCard({ title, description, image, link }: ProjectCardProps) {
  return (
    <div className="rounded-lg overflow-hidden shadow hover:shadow-lg transition min-h-[400px] flex flex-col">
      <Image src={image} alt={title} width={600} height={300} className="w-full object-cover" unoptimized />
      <div className="p-4 flex flex-col justify-between h-full bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-b-lg">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Link href={link} className="text-blue-500 hover:underline active:scale-95 transition-transform inline-block">
          View Details →
        </Link>
      </div>
    </div>
  );
}