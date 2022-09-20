import { Filter, Order, PaginationPayload } from './types';

const prepareFilter = (filters?: Record<string, Filter>): string[] => {
  if (!filters) return [];
  return Object
    .entries(filters)
    .map(([key, filter]) => `filter_${key}=${filter.type || 'eql'},${filter.value}`);
};

const prepareOrder = (order?: Order): string[] => {
  if (!order) return [];

  return [
    `order=${order.fields.join(',')}`,
    `class=${order.type || 'asc'}`,
  ];
};

export const prepareQuery = (payload?: Partial<PaginationPayload>): string => {
  if (!payload) return '';
  const query: string[] = [];

  if (payload.page) query.push(`page=${payload.page}`);
  if (payload.perPage) query.push(`per_page=${payload.perPage}`);

  query.push(...prepareFilter(payload.filters));
  query.push(...prepareOrder(payload.order));

  return query.join('&');
};