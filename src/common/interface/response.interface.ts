export interface BaseResponse<Entity = unknown> {
  data?: Entity;
  message?: string;
  success?: boolean;
}
