import { Response } from 'express';

interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200) {
  const body: SuccessResponse<T> = { success: true, data };
  if (message) body.message = message;
  return res.status(statusCode).json(body);
}

export function sendError(res: Response, statusCode: number, code: string, message: string) {
  const body: ErrorResponse = {
    success: false,
    error: { code, message },
  };
  return res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T, message?: string) {
  return sendSuccess(res, data, message, 201);
}

export function sendNoContent(res: Response) {
  return res.status(204).send();
}
