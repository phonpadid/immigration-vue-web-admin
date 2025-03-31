import type {
  IOffsetBasePaginate,
  IPaginated,
} from "@/common/interface/pagination.interface";

export type CountriesTableState = IOffsetBasePaginate & {
  is_except_visa?: "-1" | "0" | "1";
};

export type CountryResponse = {
  id: number;
  image: string;
  is_except_visa: boolean;
  created_at: string;
  updated_at: string;
  translates: {
    id: number;
    country_id: number;
    name: string;
    slug: string;
    lang: string;
    description: string;
  }[];
};
export interface Lauange {
  name: string;
  description: string;
  slug?: string;
}
export type CountryForm = {
  image: File | null | string;
  is_except_visa: boolean;
  lo: Lauange;
  en: Lauange;
  zh_cn: Lauange;
};

/************************************* */
export interface CountryDetailsResponse {
  image: File | null | string;
  is_except_visa: boolean;
  lo: Lauange;
  en: Lauange;
  zh_cn: Lauange;
  translates: string[];
  lang: string;
  created_at: string;
  updated_at: string;
}

/************************************* */

interface TranslationData {
  id?: number;
  name: string;
  description?: string;
}

export interface UpdateCountryPayload {
  lo: TranslationData;
  en: TranslationData;
  zh_cn: TranslationData;
  is_except_visa: boolean;
  image?: File | null;
}

export interface TabConfig {
  key: string;
  label: string;
  slotName: string;
}

export interface Translation {
  lang: string;
  name: string;
  description: string | null;
}

export interface CountriesResponse extends IPaginated {
  data: CountryResponse[];
}
