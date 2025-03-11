export interface IState<ResponseData, Entity> {
  list: ResponseData;
  data: Partial<Entity>;
  isLoading: boolean;
}
