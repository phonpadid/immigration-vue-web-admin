export interface IPagination<Entity> {
  page?: number;
  limit?: number;
  filter?: Partial<Entity>;
  search?: any;
}

export interface IResponseData<Entity> {
  data: Entity[];
  total: number;
}

/**************************************************************** */
import { type IOrderBy } from "./order-by";

export interface IOffsetBasePaginate extends IOrderBy {
  offset?: number;
  limit?: number;
}

export interface ICursorBasePaginate {
  cursor: string;
  limit: number;
  length: number;
}

export interface IPaginated {
  total: number;
}
