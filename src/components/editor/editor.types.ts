// types/editor.types.ts
export interface FileItem {
  id: number;
  parent_id: number | null;
  name: string;
  size: number;
  type: string;
  path?: string;
  created_at: string;
  updated_at: string;
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  path: string;
}

export interface EditorProps {
  modelValue: string;
  theme?: "snow" | "bubble";
  placeholder?: string;
  readonly?: boolean;
  error?: string;
  height?: number;
}

export interface QuillContent {
  type: string;
  content: Array<{
    type: string;
    content?: Array<{
      type: string;
      text?: string;
    }>;
  }>;
}
