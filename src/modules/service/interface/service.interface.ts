import type {
  IOffsetBasePaginate,
  IPaginated,
} from "@/common/interface/pagination.interface";
import type { Content } from "@tiptap/core";
export type ServiceTableState = IOffsetBasePaginate & {
  lang: "lo" | "en" | "zh_cn";
};

export type ServiceState = {
  id: string;
  lang: "lo" | "en" | "zh_cn";
};

export type ServiceDetailResponse = {
  id: number;
  created_at: string;
  updated_at: string;
  translates: {
    id: number;
    description: string;
    lang: "zh_cn" | "lo" | "en";
    title: string;
    content: unknown;
    service_id: number;
  }[];
};

export type ServiceResponse = {
  lang_id: number;
  title: string;
  id: number;
  created_at: string;
  updated_at: string;
};
export type ServiceForm = {
  id: number;
  lang: "lo" | "en" | "zh_cn";
  title: string;
  description: string;
  content: string;
};
/************************************/
export type ServicesCategoryForm = {
  title: string;
  content: Content;
  description: string;
};
export type ServicesForm = {
  id: number;
  title: string;
  lo: ServicesCategoryForm;
  en: ServicesCategoryForm;
  zh_cn: ServicesCategoryForm;
};

export interface ServiceStates {
  [key: string]: {
    data: ServicesForm[];
    total: number;
  };
}
export interface ServiceFormData {
  title: string;
  content: string;
  description: string;
}

export interface SevicesFormState {
  lo: ServiceFormData;
  en: ServiceFormData;
  zh_cn: ServiceFormData;
}

/*************************To Table ************************* */

export type LanguageKey = "1" | "2" | "3";
export type ApiLangKey = "lo" | "en" | "zh_cn";

/*************************To Table ************************* */

export interface ServicesResponse extends IPaginated {
  data: ServiceResponse[];
}
