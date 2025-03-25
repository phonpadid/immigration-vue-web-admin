import type {
  IOffsetBasePaginate,
  IPaginated,
} from "@/common/interface/pagination.interface";

export type CheckpointCategoryTableState = IOffsetBasePaginate;

export type CheckpointCategoryDetailResponse = {
  id: number;
  created_at: string;
  updated_at: string;
  translates: {
    id: number;
    title: string;
    description: string;
    lang: "lo" | "en" | "zh_cn";
  }[];
};

export type CheckpointCategoryResponse = {
  id: number;
  created_at: string;
  updated_at: string;
  translates: {
    id: number;
    title: string;
    lang: "lo" | "en" | "zh_cn";
  }[];
};

// Save to form
interface LanguageData {
  title: string;
  description: string;
}

export interface CheckpointCategoriesForm {
  lo: LanguageData;
  en: LanguageData;
  zh_cn: LanguageData;
}

export interface CheckpointCategoriesResponse extends IPaginated {
  data: CheckpointCategoryResponse[];
}
