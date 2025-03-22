import type {
  IOffsetBasePaginate,
  IPaginated,
} from "@/common/interface/pagination.interface";

export type ContactTableState = IOffsetBasePaginate;

export type ContactResponse = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
  updated_at: string;
};

export interface ContactsResponse extends IPaginated {
  data: ContactResponse[];
}
