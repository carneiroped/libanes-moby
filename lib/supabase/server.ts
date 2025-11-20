/**
 * Server-side database client to replace Supabase with Azure SQL
 * Used in Next.js API routes
 */

// Mock Azure client for demo
const azureClient = {
  get: (endpoint: string) => Promise.resolve({ data: [], error: null }),
  post: (endpoint: string, body: any) => Promise.resolve({ data: null, error: null }),
  put: (endpoint: string, body: any) => Promise.resolve({ data: null, error: null }),
  patch: (endpoint: string, body: any) => Promise.resolve({ data: null, error: null }),
  delete: (endpoint: string) => Promise.resolve({ data: null, error: null })
};

interface DatabaseRecord {
  [key: string]: any;
}

interface AuthUser {
  id: string;
  email?: string;
  [key: string]: any;
}

interface AuthResponse {
  data: {
    user: AuthUser | null;
  };
  error: any;
}

interface AuthClient {
  getUser(): Promise<AuthResponse>;
}

interface QueryBuilder {
  from(table: string): QueryBuilder;
  select(columns?: string, options?: { count?: 'exact' }): QueryBuilder;
  eq(column: string, value: any): QueryBuilder;
  gte(column: string, value: any): QueryBuilder;
  lte(column: string, value: any): QueryBuilder;
  lt(column: string, value: any): QueryBuilder;
  gt(column: string, value: any): QueryBuilder;
  in(column: string, values: any[]): QueryBuilder;
  or(query: string): QueryBuilder;
  ilike(column: string, pattern: string): QueryBuilder;
  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): QueryBuilder;
  limit(count: number): QueryBuilder;
  range(from: number, to: number): QueryBuilder;
  single(): QueryBuilder;
  insert(data: any): QueryBuilder;
  update(data: any): QueryBuilder;
  upsert(data: any): QueryBuilder;
  delete(): QueryBuilder;
  then<T>(
    onfulfilled?: ((value: { data: any; error: any; count?: number | null }) => T | PromiseLike<T>) | null,
    onrejected?: ((reason: any) => T | PromiseLike<T>) | null
  ): Promise<T>;
}

class DatabaseClient implements QueryBuilder {
  private tableName: string = '';
  private selectColumns: string = '*';
  private selectOptions: { count?: 'exact' } = {};
  private conditions: Array<{ column: string; operator: string; value: any }> = [];
  private orderBy: { column: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private rangeFrom: number | null = null;
  private rangeTo: number | null = null;
  private singleResult: boolean = false;
  private isInsert: boolean = false;
  private isUpdate: boolean = false;
  private isDelete: boolean = false;
  private insertData: any = null;
  private updateData: any = null;

  // Auth client
  public auth: AuthClient = {
    getUser: async (): Promise<AuthResponse> => {
      // Mock auth para modo demo
      return {
        data: {
          user: {
            id: 'demo-user-id',
            email: 'demo@moby.com.br',
          }
        },
        error: null
      };
    }
  };

  from(table: string): QueryBuilder {
    this.tableName = table;
    return this;
  }

  select(columns?: string, options?: { count?: 'exact' }): QueryBuilder {
    if (columns) {
      this.selectColumns = columns;
    }
    if (options) {
      this.selectOptions = options;
    }
    return this;
  }

  eq(column: string, value: any): QueryBuilder {
    this.conditions.push({ column, operator: '=', value });
    return this;
  }

  gte(column: string, value: any): QueryBuilder {
    this.conditions.push({ column, operator: '>=', value });
    return this;
  }

  lte(column: string, value: any): QueryBuilder {
    this.conditions.push({ column, operator: '<=', value });
    return this;
  }

  lt(column: string, value: any): QueryBuilder {
    this.conditions.push({ column, operator: '<', value });
    return this;
  }

  gt(column: string, value: any): QueryBuilder {
    this.conditions.push({ column, operator: '>', value });
    return this;
  }

  in(column: string, values: any[]): QueryBuilder {
    this.conditions.push({ column, operator: 'IN', value: values });
    return this;
  }

  or(query: string): QueryBuilder {
    // Mock implementation - apenas adiciona condição
    this.conditions.push({ column: '_or', operator: 'OR', value: query });
    return this;
  }

  ilike(column: string, pattern: string): QueryBuilder {
    this.conditions.push({ column, operator: 'ILIKE', value: pattern });
    return this;
  }

  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): QueryBuilder {
    this.orderBy = { column, ascending: options?.ascending !== false };
    return this;
  }

  limit(count: number): QueryBuilder {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number): QueryBuilder {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  single(): QueryBuilder {
    this.singleResult = true;
    return this;
  }

  insert(data: any): QueryBuilder {
    this.isInsert = true;
    this.insertData = data;
    return this;
  }

  update(data: any): QueryBuilder {
    this.isUpdate = true;
    this.updateData = data;
    return this;
  }

  upsert(data: any): QueryBuilder {
    this.isInsert = true;
    this.insertData = data;
    return this;
  }

  delete(): QueryBuilder {
    this.isDelete = true;
    return this;
  }

  then<T>(
    onfulfilled?: ((value: { data: any; error: any; count?: number | null }) => T | PromiseLike<T>) | null,
    onrejected?: ((reason: any) => T | PromiseLike<T>) | null
  ): Promise<T> {
    return this.executeQuery().then(onfulfilled, onrejected);
  }

  private async executeQuery(): Promise<{ data: any; error: any; count?: number | null }> {
    try {
      let endpoint = '';
      let method = 'GET';
      let body: any = null;

      if (this.isInsert) {
        endpoint = `/api/database/${this.tableName}`;
        method = 'POST';
        body = this.insertData;
      } else if (this.isUpdate) {
        endpoint = `/api/database/${this.tableName}`;
        method = 'PATCH';
        body = {
          data: this.updateData,
          conditions: this.conditions
        };
      } else if (this.isDelete) {
        endpoint = `/api/database/${this.tableName}`;
        method = 'DELETE';
        body = { conditions: this.conditions };
      } else {
        // SELECT query
        const params = new URLSearchParams();
        if (this.selectColumns !== '*') {
          params.set('select', this.selectColumns);
        }
        this.conditions.forEach((condition, index) => {
          params.set(`filter${index}`, `${condition.column}:${condition.operator}:${condition.value}`);
        });
        if (this.orderBy) {
          params.set('order', `${this.orderBy.column}:${this.orderBy.ascending ? 'asc' : 'desc'}`);
        }
        if (this.limitCount) {
          params.set('limit', this.limitCount.toString());
        }
        if (this.rangeFrom !== null && this.rangeTo !== null) {
          params.set('range', `${this.rangeFrom}-${this.rangeTo}`);
        }
        if (this.singleResult) {
          params.set('single', 'true');
        }
        if (this.selectOptions.count === 'exact') {
          params.set('count', 'exact');
        }

        endpoint = `/api/database/${this.tableName}?${params.toString()}`;
      }

      let response;
      switch (method.toUpperCase()) {
        case 'GET':
          response = await azureClient.get(endpoint);
          break;
        case 'POST':
          response = await azureClient.post(endpoint, body);
          break;
        case 'PUT':
          response = await azureClient.put(endpoint, body);
          break;
        case 'PATCH':
          response = await azureClient.patch(endpoint, body);
          break;
        case 'DELETE':
          response = await azureClient.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      // Retornar com count se solicitado
      const result: { data: any; error: any; count?: number | null } = {
        data: response.data,
        error: null
      };

      if (this.selectOptions.count === 'exact') {
        // Mock count - em produção viria da resposta
        result.count = Array.isArray(response.data) ? response.data.length : null;
      }

      return result;
    } catch (error: any) {
      console.error('Database query error:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Database query failed',
          details: error.response?.data
        },
        count: null
      };
    }
  }
}

// Interface para o cliente completo com auth
export interface SupabaseClient {
  auth: AuthClient;
  from(table: string): QueryBuilder;
}

/**
 * Create a server-side database client
 * This is a compatibility layer to replace createClient from '@/lib/supabase/server'
 */
export async function createClient(): Promise<SupabaseClient> {
  return new DatabaseClient() as SupabaseClient;
}

export async function createServerClient(): Promise<SupabaseClient> {
  return new DatabaseClient() as SupabaseClient;
}

export default createClient;