import type { Content } from "@tiptap/core";
import type {
  ICursorBasePaginate,
  IPaginated,
} from "@/common/interface/pagination.interface";

export type VisaCategoryTableState = ICursorBasePaginate & {
  lang: "lo" | "en" | "zh_cn";
} & VisaCategoriesResponse;

export type VisaCategoryState = {
  id: string;
  lang: "lo" | "en" | "zh_cn";
};

export type VisaCategoryDetailResponse = {
  id: number;
  created_at: string;
  updated_at: string;
  lang_id: number;
  name: string;
  content: Content;
};

export type VisaCategoryResponse = {
  id: number;
  created_at: string;
  updated_at: string;
  translates: {
    id: number;
    name: string;
    content: object;
    lang: "lo" | "en" | "zh_cn";
  }[];
};
export type VisaCategoryForm = {
  name: string;
  content: Content;
};

export type VisaForm = {
  id: number;
  name: string;
  lo: VisaCategoryForm;
  en: VisaCategoryForm;
  zh_cn: VisaCategoryForm;
};
export interface VisaContentData {
  type: string;
  content: Array<{
    type: string;
    content?: Array<{
      type: string;
      text?: string;
    }>;
  }>;
}

export interface VisaFormData {
  name: string;
  content: string;
  date?: string;
  userLogin?: string;
}

export interface TextContent {
  type: "text";
  text: string;
}

export interface HardBreak {
  type: "hardBreak";
}
export type LanguageKey = "lo" | "en" | "zh_cn";

export interface TabConfig {
  key: string;
  label: string;
  slotName: string;
  lang: LanguageKey;
}

export interface ParagraphContent {
  type: "paragraph";
  attrs?: {
    textAlign: string;
  };
  content: Array<TextContent | HardBreak>;
}

export interface ImageContent {
  type: "image";
  attrs: {
    src: string;
    alt: string;
    title: null;
  };
}

export interface DocumentContent {
  type: "doc";
  content: Array<ParagraphContent | ImageContent>;
}
export interface VisaTranslate {
  id: number;
  visa_category_id: number;
  name: string;
  content: {
    type: string;
    content: Array<{
      type: string;
      attrs?: {
        textAlign?: string;
        alt?: string;
        src?: string;
        title?: null;
      };
      content?: Array<{
        text: string;
        type: string;
      }>;
    }>;
  };
  lang: string;
}

export interface VisaLanguageContent {
  name: string;
  content: string;
  date?: string;
  userLogin?: string;
}

export interface VisaFormState {
  lo: VisaFormData;
  en: VisaFormData;
  zh_cn: VisaFormData;
}

export interface FormRules {
  [key: string]: {
    required?: boolean;
    message?: string;
    trigger?: "blur" | "change";
  }[];
}
export interface VisaState {
  [key: string]: {
    data: VisaForm[];
    total: number;
  };
}

export interface VisaCategoriesResponse extends IPaginated {
  data: {
    id: number;
    created_at: string;
    updated_at: string;
    lang_id: number;
    name: string;
  }[];
}
