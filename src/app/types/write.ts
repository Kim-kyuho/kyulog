// src/app/types/write.ts

export interface PostFormData {
    id?: string;
    title: string;
    summary: string;
    tags: string;
    category: string;
    content: string;
  }
  
  export interface WritePageProps {
    initialData?: PostFormData;
    isEditMode?: boolean;
  }
  