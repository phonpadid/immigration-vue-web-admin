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
