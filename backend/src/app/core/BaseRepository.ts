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

export interface ListOptions<T> {
  fields?: (keyof T)[];
  page?: number;
  limit?: number;
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

  public async list(options: ListOptions<T> = {}): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 25;

    let selectFields = ['*'];

    if (options.fields) {
      selectFields = options.fields as string[];
    }

    const data = await this.db(this.tableName)
      .select(selectFields)
      .whereNull('deletedAt')
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
