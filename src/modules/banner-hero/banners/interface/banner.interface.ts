import type {
  IOffsetBasePaginate,
  IPaginated,
} from "@/common/interface/pagination.interface";

export type BannerTableState = IOffsetBasePaginate & {
  is_private?: string;
  is_inactive?: string;
};

export type BannerResponse = {
  id: number;
  image: string;
  link: string;
  is_private: boolean;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  translates: {
    id: number;
    banner_id: number;
    lang: string;
    title: string;
    description: string;
  }[];
};

export type BannerForm = {
  id?: number;
  image: File | string;
  link: string;
  start_time: string;
  end_time: string;
  is_private: boolean;
  lo_title: string;
  lo_description: string;
  en_title: string;
  en_description: string;
  zh_cn_title: string;
  zh_cn_description: string;
};

export interface BannersResponse extends IPaginated {
  banners: BannerResponse[];
}
