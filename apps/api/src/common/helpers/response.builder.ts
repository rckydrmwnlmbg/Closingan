import { PaginationMeta } from '../types/pagination-meta.type';

export class ResponseBuilder {
  static success<T>(data: T) {
    return { success: true, data };
  }

  static list<T>(data: T[], meta: PaginationMeta) {
    return { success: true, data, meta };
  }
}
