import { PaginationMeta } from '../types/pagination-meta.type';
export declare class ResponseBuilder {
    static success<T>(data: T): {
        success: boolean;
        data: T;
    };
    static list<T>(data: T[], meta: PaginationMeta): {
        success: boolean;
        data: T[];
        meta: PaginationMeta;
    };
}
