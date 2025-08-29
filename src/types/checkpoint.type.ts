import type {
  QuillDelta,
  QuillContent,
} from "@/components/editor/editor.types";

// ภาษาที่รองรับในระบบ
export type SupportedLanguage = "lo" | "en" | "zh_cn";

// ประเภทประเทศที่รองรับ
export type CountryType =
  | ""
  | "myanmar"
  | "thailand"
  | "vietnam"
  | "cambodia"
  | "china";

// Interface สำหรับการแปลในแต่ละภาษา
export interface Translation {
  id?: number;
  name: string;
  slug?: string;
  time_operation: string;
  address: string;
  content: string | QuillDelta | QuillContent;
  lang: SupportedLanguage;
}

// Interface สำหรับข้อมูลด่าน
export interface Checkpoint {
  id: number;
  category_id: number;
  province_id: number;
  country: CountryType;
  image: string;
  link_map: string;
  phone_number: string;
  email: string;
  visa: boolean;
  e_visa: boolean;
  is_open: boolean;
  created_at: string;
  updated_at: string;
  translates: Translation[];
}

// Interface สำหรับฟอร์มสร้าง/แก้ไขด่าน
export interface CheckpointForm {
  category_id: number;
  province_id: number;
  country: CountryType;
  image: File | string | null;
  link_map: string;
  phone_number: string;
  email: string;
  visa: boolean;
  e_visa: boolean;
  is_open: boolean;
  translates: Record<
    SupportedLanguage,
    Omit<Translation, "lang" | "id" | "slug">
  >;
}

// Interface สำหรับ Response จาก API
export interface CheckpointResponse {
  data: Checkpoint[];
  total: number;
}

// Interface สำหรับ Tab Configuration
export interface TabConfig {
  key: string;
  label: string;
  slotName: string;
  lang: SupportedLanguage;
}

// Interface สำหรับ Validation Rules
export interface ValidationRule {
  required?: boolean;
  message: string;
  trigger: "blur" | "change" | "submit";
  type?: string;
  pattern?: RegExp;
  validator?: (rule: ValidationRule, value: any) => Promise<void> | void;
}

// Type สำหรับ Form Validation Rules
export type ValidationRules = Record<string, ValidationRule[]>;
