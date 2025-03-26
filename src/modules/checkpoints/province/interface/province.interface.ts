import type {
  IOffsetBasePaginate,
  IPaginated,
} from "@/common/interface/pagination.interface";

export type ProvinceTableState = IOffsetBasePaginate;

export type ProvinceResponse = {
  id: number;
  created_at: string;
  updated_at: string;
  countries: { id: number; country: string; provinceId: number }[];
  translates: {
    id: number;
    country_ids: number;
    name: string;
    slug: string;
    lang: string;
  }[];
};

interface LanguageData {
  name: string;
}

export type ProvinceForm = {
  country_ids: number[];
  lo: LanguageData;
  en: LanguageData;
  zh_cn: LanguageData;
};

export interface ProvincesResponse extends IPaginated {
  data: ProvinceResponse[];
}
