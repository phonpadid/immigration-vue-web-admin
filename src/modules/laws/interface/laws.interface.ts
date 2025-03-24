import type {
  IOffsetBasePaginate,
  IPaginated,
} from "@/common/interface/pagination.interface";

export type LawTableState = IOffsetBasePaginate;

export type LawResponse = {
  id: number;
  name: string;
  file: string;
  created_at: string;
  updated_at: string;
};

export type LawForm = {
  name: string;
  file: string | null | File;
};

export interface LawsResponse extends IPaginated {
  laws: LawResponse[];
}
