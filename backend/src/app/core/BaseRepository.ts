import { ulid } from 'ulid';
import { Knex } from 'knex';
import knex from '../../database';

export interface BaseEntity {
  id: string;
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  totalPages?: number;
  total?: number;
}

// eslint-disable-next-line no-shadow
export enum FilterTypes {
  FILTER_EQUAL = 'eql',
  FILTER_GREATER_THAN = 'gt',
  FILTER_GREATER_THAN_OR_EQUAL = 'gte',
  FILTER_LESS_THAN = 'lt',
  FILTER_LESS_THAN_OR_EQUAL = 'lte',
  FILTER_LIKE = 'lik',
  FILTER_NOT_EQUAL = 'neq',
  FILTER_NOT_NULL = 'nnu',
  FILTER_NULL = 'nul',
  FILTER_BETWEEN = 'btw',
  FILTER_IN = 'in',
}

export interface Filter<T> {
  field: keyof T & string;
  value: string;
  type: FilterTypes;
}

export interface OrderBy<T> {
  field: keyof T & string;
  type: 'asc' | 'desc'
}

export interface ListOptions<T> {
  fields?: (keyof T)[];
  filters?: Filter<T>[];
  page?: number;
  limit?: number;
  order?: OrderBy<T>;
}

export class BaseRepository<T extends BaseEntity> {
  public tableName: string;

  public db: Knex;

  constructor() {
    this.db = knex;
  }

  public generateId(): string {
    return ulid();
  }

  public async count(): Promise<number> {
    const result = await this.db(this.tableName)
      .count({ total: 'id' })
      .whereNull('deletedAt')
      .first();

    if (!result) {
      throw Error('Failed to count');
    }

    return result.total as number;
  }

  public async insert(payload: Omit<T, keyof BaseEntity>): Promise<string> {
    const id = this.generateId();
    await this.db(this.tableName)
      .insert({
        id,
        ...payload,
      });

    return id;
  }

  public async bulkInsert(payloads: Array<Omit<T, keyof BaseEntity>>): Promise<string[]> {
    const ids = payloads.map(() => this.generateId());
    const insertPayloads = payloads.map((payload, index) => ({
      id: ids[index],
      ...payload,
    }));

    await this.db(this.tableName)
      .insert(insertPayloads);

    return ids;
  }

  public async update(id: string, payload: Partial<Omit<T, keyof BaseEntity>>): Promise<boolean> {
    const date = new Date();

    delete payload['id'];
    delete payload['createdAt'];
    delete payload['updatedAt'];
    delete payload['deletedAt'];

    await this.db(this.tableName)
      .where({ id })
      .update({ ...payload, updatedAt: date });

    return true;
  }

  public async delete(id: string): Promise<boolean> {
    const date = new Date();
    await this.db(this.tableName)
      .where({ id })
      .whereNull('deletedAt')
      .update<T>({
        updatedAt: date,
        deletedAt: date,
      });

    return true;
  }

  private convertFilterTypeToOperator(type: FilterTypes): string | null {
    switch (type) {
      case FilterTypes.FILTER_EQUAL:
        return '=';
      case FilterTypes.FILTER_NOT_EQUAL:
        return '<>';
      case FilterTypes.FILTER_GREATER_THAN:
        return '>';
      case FilterTypes.FILTER_GREATER_THAN_OR_EQUAL:
        return '>=';
      case FilterTypes.FILTER_LESS_THAN:
        return '<';
      case FilterTypes.FILTER_LESS_THAN_OR_EQUAL:
        return '<=';
      case FilterTypes.FILTER_LIKE:
        return 'LIKE';
      case FilterTypes.FILTER_NULL:
        return 'IS NULL';
      case FilterTypes.FILTER_NOT_NULL:
        return 'IS NOT NULL';
      case FilterTypes.FILTER_IN:
        return 'IN';
      case FilterTypes.FILTER_BETWEEN:
        return 'BETWEEN';
      default:
        return null;
    }
  }

  public applyFilters(
    query: Knex.QueryBuilder,
    filters: Filter<T>[],
    prefix = '',
  ): Knex.QueryBuilder {
    filters.forEach((filter) => {
      const { field, value, type } = filter;

      const operator = this.convertFilterTypeToOperator(type);
      switch (operator) {
        case 'IS NULL':
          query.whereNull(`${prefix}${field}`);
          break;

        case 'IS NOT NULL':
          query.whereNotNull(`${prefix}${field}`);
          break;

        case 'IN':
        case 'BETWEEN': {
          const values = value.split('|');
          query.where(`${prefix}${field}`, operator, values);
          break;
        }

        case 'LIKE':
          query.where(`${prefix}${field}`, operator, `%${value}%`);
          break;

        case null:
          break;

        default:
          query.where(`${prefix}${field}`, operator, value);
      }
    });

    return query;
  }

  public async list(options: ListOptions<T> = {}): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 25;

    let selectFields = ['*'];

    if (options.fields) {
      selectFields = options.fields as string[];
    }

    let query = this.db(this.tableName)
      .select(selectFields)
      .whereNull('deletedAt');

    if (options.filters) {
      query = this.applyFilters(query, options.filters);
    }

    if (options.order) {
      query.orderBy(options.order.field, options.order.type);
    }

    const data = await query
      .offset((page - 1) * limit)
      .limit(limit) as T[];

    return {
      data,
      page,
      limit,
    };
  }

  public async listAll(): Promise<T[]> {
    const data = await this.db(this.tableName)
      .select('*') as T[];

    return data;
  }

  public async getBulk(ids: string[]): Promise<T[]> {
    const data = await this.db(this.tableName)
      .select('*')
      .whereIn('id', ids);

    return data;
  }

  public async getById(id: string): Promise<T | null> {
    const data = await this.db(this.tableName)
      .select('*')
      .where({ id })
      .whereNull('deletedAt')
      .limit(1)
      .first() as T;

    return data || null;
  }
}
