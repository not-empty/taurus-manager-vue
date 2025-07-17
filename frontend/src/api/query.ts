import type { Filter, OrderBy, PaginationPayload } from './types';

export const prepareFilter = <T>(filters?: Filter<T>[]): string[] => {
  if (!filters) return [];
  return filters.map(
    (filter) => `filter_${filter.field}=${filter.type || 'eql'},${filter.value}`,
  );
};

export const prepareOrder = <T>(order?: OrderBy<T>): string[] => {
  if (!order) return [];
  return [`order=${order.field},${order.type}`];
};


export const prepareQuery = <T>(payload?: Partial<PaginationPayload<T>>): string => {
  if (!payload) return '';
  const query: string[] = [];

  if (payload.page) query.push(`page=${payload.page}`);
  if (payload.size) query.push(`size=${payload.size}`);

  query.push(...prepareFilter(payload.filters));
  query.push(...prepareOrder(payload.order));

  return query.join('&');
};
