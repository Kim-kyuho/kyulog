// src/app/blog/edit/[id]/EditClient.tsx

"use client";
import WritePage from "@/components/WritePage";
import type { PostFormData } from "@/app/types/write";

interface EditClientProps {
  initialData: PostFormData;
}

export default function EditClient({ initialData }: EditClientProps) {
  return <WritePage initialData = {initialData} isEditMode={true} />;
}
