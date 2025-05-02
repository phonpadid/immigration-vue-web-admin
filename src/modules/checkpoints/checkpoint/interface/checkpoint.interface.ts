export type TabLanguage = "lo" | "en" | "zh_cn";

export interface TabConfig {
  key: string;
  label: string;
  slotName: string;
  lang: TabLanguage;
}

export interface CheckpointTranslate {
  name: string;
  time_operation: string;
  address: string;
  content: string;
}

export interface CheckpointForm {
  category_id: number;
  province_id: number;
  image: File | string | null;
  link_map: string;
  phone_number: string;
  email: string;
  visa: boolean;
  e_visa: boolean;
  translates: Record<TabLanguage, CheckpointTranslate>;
}

export interface CreateCheckpointPayload {
  category_id: number;
  province_id: number;
  phone_number: string;
  email: string;
  link_map: string;
  visa: boolean;
  e_visa: boolean;
  lo: string;
  en: string;
  zh_cn: string;
  image?: File;
}
