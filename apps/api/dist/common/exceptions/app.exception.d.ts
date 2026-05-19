import { HttpException } from '@nestjs/common';
export declare class AppException extends HttpException {
    constructor(code: string, message: string, httpStatus?: number, details?: {});
}
