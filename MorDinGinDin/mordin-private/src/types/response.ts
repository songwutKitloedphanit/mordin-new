export type BaseResponse<T = unknown> = {
  code: number;
  message: string;
  data: T;
  error?: string;
};
