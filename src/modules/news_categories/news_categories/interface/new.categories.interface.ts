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
  id: number;
  lo: LanguageData;
  en: LanguageData;
  zh_cn: LanguageData;
  translates: {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    lang: string;
  }[];
}

export interface CreateNewsCategoryForm {
  lo: {
    name: string;
  };
  en: {
    name: string;
  };
  zh_cn: {
    name: string;
  };
}

// Type สำหรับ news category ที่มีอยู่ในระบบ
export interface NewsCategoryForm extends CreateNewsCategoryForm {
  id: number;
  translate: boolean;
}

export interface NewsCategoriessResponse extends IPaginated {
  data: NewCategoriessResponse[];
}
