import { HttpException } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(code: string, message: string, httpStatus = 400, details = {}) {
    super({ success: false, error: { code, message, details } }, httpStatus);
  }
}
