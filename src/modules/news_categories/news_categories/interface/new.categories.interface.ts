import type {
  IOffsetBasePaginate,
  IPaginated,
} from "@/common/interface/pagination.interface";

export type NewCategoriessTableState = IOffsetBasePaginate;

export type NewCategoriessResponse = {
  id: number;
  created_at: string;
  updated_at: string;
  translates: {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    lang: string;
  }[];
};

interface LanguageData {
  name: string;
}

export interface NewsCategoryForm {
  lo: LanguageData;
  en: LanguageData;
  zh_cn: LanguageData;
}

export interface NewsCategoriessResponse extends IPaginated {
  data: NewCategoriessResponse[];
}
