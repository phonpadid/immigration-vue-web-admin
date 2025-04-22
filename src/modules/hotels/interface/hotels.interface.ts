import type {
  IOffsetBasePaginate,
  IPaginated,
} from "@/common/interface/pagination.interface";

export type HotelTableState = IOffsetBasePaginate & { is_published?: string };

export type HotelResponse = {
  id: number;
  image: string;
  link: string;
  link_map: string;
  phone_number: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  translates: {
    id: number;
    hotel_id: number;
    lang: string;
    name: string;
    province: string;
    district: string;
    village: string;
  }[];
  user: {
    id: number;
    created_at: string;
    updated_at: string;
    hotel_id: number;
    email: string;
    password: string;
  };
};

export type HotelForm = {
  id: number;
  image: string;
  map_link: string;
  phone_number: string;
  link: string;
  is_published: boolean;
  lo_name: string;
  lo_address: string;
  en_name: string;
  en_address: string;
  zh_name: string;
  zh_address: string;
};

export interface HotelsResponse extends IPaginated {
  hotels: HotelResponse[];
}
