import type {
  IOffsetBasePaginate,
  IPaginated,
} from "@/common/interface/pagination.interface";

export type NewTableState = IOffsetBasePaginate & {
  category_id?: string;
  status?: "draft" | "published" | "private";
};

export type NewResponse = {
  id: number;
  category_id: number;
  category: {
    id: number;
    translates: {
      id: number;
      lang: "lo" | "en" | "zh_cn";
      name: string;
    }[];
  };
  thumbnail: string;
  status: "draft" | "published" | "private";
  public_at: string;
  created_at: string;
  updated_at: string;
  translates: {
    id: number;
    news_id: number;
    title: string;
    slug: string;
    description: string;
    content: string;
    lang: string;
  }[];
};

export interface NewForm {
  category_id: string;
}
interface LanguageItem {
  name: string;
}

interface CategoryData {
  id?: number;
  lo: LanguageItem;
  en: LanguageItem;
  zh_cn: LanguageItem;
}
export interface CategoryTranslate {
  id: number;
  lang: string;
  name: string;
  lo: { name: string };
  en: { name: string };
  zh_cn: { name: string };
}

export interface Category {
  id: number;
  translates: CategoryTranslate[];
}
export interface TabConfig {
  key: string;
  label: string;
  slotName: string;
  lang: TabLanguage;
}
export interface TabConfigDetails {
  key: string;
  label: string;
  slotName: string;
  lang: string;
}
export type TabLanguage = "lo" | "en" | "zh_cn";

export interface NewsResponse extends IPaginated {
  news: NewResponse[];
}
