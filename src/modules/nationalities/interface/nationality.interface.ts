import type {
  IOffsetBasePaginate,
  IPaginated,
} from "@/common/interface/pagination.interface";

export type NationalityTableState = IOffsetBasePaginate & {
  lang: "lo" | "en" | "zh_cn";
};

export type NationalityState = {
  id: string;
  lang: "lo" | "en" | "zh_cn";
};

export type NationalityDetailResponse = {
  id: number;
  created_at: string;
  updated_at: string;
  translates: {
    id: number;
    name: string;
    lang: "zh_cn" | "lo" | "en";
    nationality_id: number;
    short_name?: string;
  }[];
};

export type NationalityResponse = {
  lang_id: number;
  name: string;
  id: number;
  created_at: string;
  updated_at: string;
};

export type NationalityForm = {
  id: number;
  lang: "lo" | "en" | "zh_cn";
  name: string;
  short_name?: string;
};

export type NationalityFormData = {
  name: string;
  short_name?: string;
};

export type NationalityFormState = {
  lo: NationalityFormData;
  en: NationalityFormData;
  zh_cn: NationalityFormData;
};

export interface NationalityStates {
  [key: string]: {
    data: NationalityResponse[];
    total: number;
  };
}

/*************************To Table ************************* */

export type LanguageKey = "1" | "2" | "3";
export type ApiLangKey = "lo" | "en" | "zh_cn";
// Define explicit type for tab language
export type TabLanguage = "lo" | "en" | "zh_cn";
// Define tab configuration with proper typing
export interface TabConfig {
  key: string;
  label: string;
  slotName: string;
  lang: TabLanguage;
}

/*************************To Table ************************* */

export interface NationalityResponse extends IPaginated {
  data: NationalityResponse[];
}
