import { Request } from 'express';
import { Filter, FilterTypes, OrderBy } from './BaseRepository';

function parseFilterFromRequest<T>(field: string, filterValue: string): Filter<T> | null {
  const [type, value] = filterValue.split(',');

  const filterType = Object.values(FilterTypes).find((v) => v === type);

  if (filterType && field) {
    return {
      field: field as keyof T & string,
      value,
      type: filterType as FilterTypes,
    };
  }

  return null;
}

export function getFilters<T>(
  request: Request,
  allowedFields: (keyof T & string)[],
): Filter<T>[] {
  const filters: Filter<T>[] = [];

  for (const [key, value] of Object.entries(request.query)) {
    if (key.startsWith('filter_') && typeof value === 'string') {
      const field = key.replace('filter_', '') as keyof T & string;

      // eslint-disable-next-line no-continue
      if (!allowedFields.includes(field)) continue;

      const filter = parseFilterFromRequest(field, value);
      if (filter) {
        filters.push(filter);
      }
    }
  }

  return filters;
}

function parseOrderFromRequest<T>(orderValue: string): OrderBy<T> | null {
  const [field, type] = orderValue.split(',') as [string, string];

  const lowerType = type?.toLowerCase();
  if ((lowerType === 'asc' || lowerType === 'desc') && field) {
    return {
      field: field as keyof T & string,
      type: lowerType as 'asc' | 'desc',
    };
  }

  return null;
}

export function getOrderBy<T>(
  request: Request,
  allowedFields: (keyof T & string)[],
): OrderBy<T> | undefined {
  const value = request.query.order;

  if (typeof value !== 'string') return undefined;

  const order = parseOrderFromRequest<T>(value);
  if (order && allowedFields.includes(order.field)) {
    return order;
  }

  return undefined;
}
