import { PaginationPayload } from './types';

export const prepareQuery = (payload?: Partial<PaginationPayload>): string => {
  if (!payload) return '';
  const query: string[] = [];

  if (payload.page) query.push(`page=${payload.page}`);
  if (payload.size) query.push(`size=${payload.size}`);

  return query.join('&');
};
