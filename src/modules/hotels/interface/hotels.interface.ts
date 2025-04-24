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
  id?: number;
  image: File | string | null;
  link: string;

  phone_number: string;
  is_published: string | boolean;
  lo: {
    name: string;
    province: string;
    district: string;
    village: string;
  };
  en: {
    name: string;
    province: string;
    district: string;
    village: string;
  };
  zh_cn: {
    name: string;
    province: string;
    district: string;
    village: string;
  };
  user?: {
    email: string;
    password: string;
  };
};

/**************************Show data Details***************************** */
// กำหนด interface สำหรับข้อมูลแปล
export interface TranslateData {
  id?: number;
  name: string;
  province: string;
  district: string;
  village: string;
}

// กำหนด interface สำหรับข้อมูลผู้ใช้
export interface UserData {
  id: number;
  email: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

// กำหนด interface สำหรับข้อมูลโรงแรมทั้งหมด
export interface HotelDetailData {
  id: number;
  image: string | null;
  link: string;
  map_link: string;
  phone_number: string;
  is_published: boolean | string;
  created_at: string;
  updated_at: string;
  user: UserData | null;
}

// กำหนด interface สำหรับ translations ทุกภาษา
export interface TranslationsData {
  lo: TranslateData;
  en: TranslateData;
  zh_cn: TranslateData;
}

// กำหนด interface สำหรับ Tab config
export interface TabConfig {
  key: string;
  label: string;
  slotName: string;
}


export interface HotelsResponse extends IPaginated {
  hotels: HotelResponse[];
}
