import type {
  IOffsetBasePaginate,
  IPaginated,
} from "@/common/interface/pagination.interface";

export interface RoleTableState extends IOffsetBasePaginate {}

export interface RoleResponse {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  permissions: {
    id: number;
    name: string;
    group_name: string;
    description: string;
    created_at: string;
  }[];
}

export interface RoleFrom {
  id:number
  name: string;
  description: string;
  permission_ids: Array<number>;
}

export interface RolesResponse extends IPaginated {
  data: Omit<RoleResponse, "permissions">[];
}
