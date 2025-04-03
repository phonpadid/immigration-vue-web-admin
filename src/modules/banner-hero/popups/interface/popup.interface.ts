import type {
  IOffsetBasePaginate,
  IPaginated,
} from "@/common/interface/pagination.interface";

export type PopupTableState = IOffsetBasePaginate & {
  is_private?: string;
  is_inactive?: string;
};

export type PopupResponse = {
  id: number;
  image: File | null;
  link: string;
  is_private: boolean;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
};
export type PopupForm = {
  id?: number;
  image: File | null;
  link: string;
  is_private: boolean;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
};
export type PopupFormCreate = {
  image: File | null;
  link: string;
  is_private: boolean;
  start_time: string;
  end_time: string;
  existingImage?: string;
};

export interface PopupsResponse extends IPaginated {
  banners: PopupResponse[];
}
