import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export const apiSuccess = <T>(
  res: Response,
  data?: T,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: ApiResponse['meta']
) => {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(payload);
};

export const apiError = (
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 500,
  errors?: Array<{ field?: string; message: string }>
) => {
  const payload: ApiResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(payload);
};
