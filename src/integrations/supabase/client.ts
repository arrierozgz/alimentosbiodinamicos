// API client — reemplaza Supabase con nuestro backend propio
// Mantiene interfaz compatible para minimizar cambios en componentes

const API_URL = import.meta.env.VITE_API_URL || '/api';

// ==========================================
// Auth state management
// ==========================================
interface User {
  id: string;
  email: string;
  display_name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

let authState: AuthState = {
  user: null,
  token: null,
};

// Load from localStorage on init
const stored = localStorage.getItem('bio_auth');
if (stored) {
  try {
    authState = JSON.parse(stored);
  } catch {}
}

function saveAuth(user: User | null, token: string | null) {
  authState = { user, token };
  if (user && token) {
    localStorage.setItem('bio_auth', JSON.stringify(authState));
  } else {
    localStorage.removeItem('bio_auth');
  }
  // Notify listeners
  authListeners.forEach(cb => cb(authState));
}

type AuthListener = (state: AuthState) => void;
const authListeners: AuthListener[] = [];

// ==========================================
// Supabase-compatible client interface
// ==========================================
async function fetchAPI(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (authState.token) {
    headers['Authorization'] = `Bearer ${authState.token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  return res;
}

// PostgREST-compatible query builder
class QueryBuilder {
  private table: string;
  private filters: string[] = [];
  private selectCols: string = '*';
  private limitVal?: number;
  private orderCol?: string;
  private orderAsc: boolean = true;
  private isSingle: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*') {
    this.selectCols = columns;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push(`${column}=eq.${value}`);
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push(`${column}=neq.${value}`);
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push(`${column}=in.(${values.join(',')})`);
    return this;
  }

  contains(column: string, value: any) {
    this.filters.push(`${column}=cs.{${value}}`);
    return this;
  }

  limit(n: number) {
    this.limitVal = n;
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this.orderCol = column;
    this.orderAsc = opts?.ascending ?? true;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  async then(resolve: (value: any) => void, reject?: (reason: any) => void) {
    try {
      const result = await this.execute();
      resolve(result);
    } catch (e) {
      if (reject) reject(e);
    }
  }

  async execute() {
    let url = `/data/${this.table}?select=${encodeURIComponent(this.selectCols)}`;
    this.filters.forEach(f => { url += `&${f}`; });
    if (this.limitVal) url += `&limit=${this.limitVal}`;
    if (this.orderCol) url += `&order=${this.orderCol}.${this.orderAsc ? 'asc' : 'desc'}`;
    if (this.isSingle) {
      url += '&limit=1';
    }

    const res = await fetchAPI(url);
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      return { data: null, error };
    }
    const data = await res.json();
    if (this.isSingle) {
      return { data: data[0] || null, error: null };
    }
    return { data, error: null };
  }
}

// Insert builder
class InsertBuilder {
  private table: string;
  private rows: any[];

  constructor(table: string, rows: any[]) {
    this.table = table;
    this.rows = rows;
  }

  async select(columns?: string) {
    const res = await fetchAPI(`/data/${this.table}`, {
      method: 'POST',
      headers: {
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(this.rows.length === 1 ? this.rows[0] : this.rows),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      return { data: null, error };
    }
    const data = await res.json();
    return { data, error: null };
  }

  async then(resolve: (value: any) => void) {
    const result = await this.select();
    resolve(result);
  }
}

// Update builder
class UpdateBuilder {
  private table: string;
  private values: any;
  private filters: string[] = [];

  constructor(table: string, values: any) {
    this.table = table;
    this.values = values;
  }

  eq(column: string, value: any) {
    this.filters.push(`${column}=eq.${value}`);
    return this;
  }

  async select(columns?: string) {
    let url = `/data/${this.table}`;
    if (this.filters.length) url += `?${this.filters.join('&')}`;

    const res = await fetchAPI(url, {
      method: 'PATCH',
      headers: {
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(this.values),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      return { data: null, error };
    }
    const data = await res.json();
    return { data, error: null };
  }

  async then(resolve: (value: any) => void) {
    const result = await this.select();
    resolve(result);
  }
}

// Delete builder
class DeleteBuilder {
  private table: string;
  private filters: string[] = [];

  constructor(table: string) {
    this.table = table;
  }

  eq(column: string, value: any) {
    this.filters.push(`${column}=eq.${value}`);
    return this;
  }

  async then(resolve: (value: any) => void) {
    let url = `/data/${this.table}`;
    if (this.filters.length) url += `?${this.filters.join('&')}`;

    const res = await fetchAPI(url, { method: 'DELETE' });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      resolve({ error });
      return;
    }
    resolve({ error: null });
  }
}

// Upsert builder
class UpsertBuilder {
  private table: string;
  private rows: any[];
  private onConflictCol?: string;

  constructor(table: string, rows: any[], options?: { onConflict?: string }) {
    this.table = table;
    this.rows = rows;
    this.onConflictCol = options?.onConflict;
  }

  async select(columns?: string) {
    let url = `/data/${this.table}`;
    if (this.onConflictCol) {
      url += `?on_conflict=${this.onConflictCol}`;
    }
    const res = await fetchAPI(url, {
      method: 'POST',
      headers: {
        'Prefer': 'return=representation,resolution=merge-duplicates',
      },
      body: JSON.stringify(this.rows.length === 1 ? this.rows[0] : this.rows),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      return { data: null, error };
    }
    const data = await res.json();
    return { data, error: null };
  }

  async then(resolve: (value: any) => void) {
    const result = await this.select();
    resolve(result);
  }
}

// ==========================================
// Main client (Supabase-compatible interface)
// ==========================================
export const supabase = {
  auth: {
    getUser: async () => {
      if (!authState.token) return { data: { user: null }, error: null };
      try {
        const res = await fetchAPI('/auth/user');
        if (!res.ok) {
          saveAuth(null, null);
          return { data: { user: null }, error: { message: 'No autenticado' } };
        }
        const { user } = await res.json();
        // Map to Supabase-like user object
        return {
          data: {
            user: {
              id: user.id,
              email: user.email,
              user_metadata: { display_name: user.display_name },
            },
          },
          error: null,
        };
      } catch (e) {
        return { data: { user: null }, error: { message: 'Error de conexión' } };
      }
    },

    getSession: async () => {
      if (!authState.token || !authState.user) {
        return { data: { session: null }, error: null };
      }
      return {
        data: {
          session: {
            access_token: authState.token,
            user: {
              id: authState.user.id,
              email: authState.user.email,
              user_metadata: { display_name: authState.user.display_name },
            },
          },
        },
        error: null,
      };
    },

    signUp: async ({ email, password }: { email: string; password: string }) => {
      try {
        const res = await fetch(`${API_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) return { data: {}, error: { message: data.error } };
        saveAuth(data.user, data.access_token);
        return {
          data: {
            user: {
              id: data.user.id,
              email: data.user.email,
              user_metadata: {},
            },
            session: { access_token: data.access_token },
          },
          error: null,
        };
      } catch (e) {
        return { data: {}, error: { message: 'Error de conexión' } };
      }
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const res = await fetch(`${API_URL}/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) return { data: {}, error: { message: data.error } };
        saveAuth(data.user, data.access_token);
        return {
          data: {
            user: {
              id: data.user.id,
              email: data.user.email,
              user_metadata: {},
            },
            session: { access_token: data.access_token },
          },
          error: null,
        };
      } catch (e) {
        return { data: {}, error: { message: 'Error de conexión' } };
      }
    },

signInWithGoogle: async (credential: string) => {      try {        const res = await fetch(`${API_URL}/auth/google`, {          method: "POST",          headers: { "Content-Type": "application/json" },          body: JSON.stringify({ credential }),        });        const data = await res.json();        if (!res.ok) return { data: {}, error: { message: data.error } };        saveAuth(data.user, data.access_token);        return {          data: { user: { id: data.user.id, email: data.user.email, user_metadata: { display_name: data.user.display_name } }, session: { access_token: data.access_token } },          error: null,        };      } catch (e) {        return { data: {}, error: { message: "Error de conexión" } };      }    },
    signInWithOtp: async ({ email }: { email: string }) => {
      // Magic link not supported in self-hosted — return friendly error
      return { data: {}, error: { message: 'Magic link no disponible. Usa email y contraseña.' } };
    },

    signOut: async () => {
      saveAuth(null, null);
      return { error: null };
    },

    updateUser: async ({ password }: { password?: string }) => {
      if (password) {
        const res = await fetchAPI('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ password }),
        });
        if (!res.ok) {
          const err = await res.json();
          return { data: {}, error: { message: err.error } };
        }
      }
      return { data: { user: authState.user }, error: null };
    },

    resetPasswordForEmail: async (email: string) => {
      // Not supported in self-hosted without email sending
      return { data: {}, error: { message: 'Contacta con el administrador para restablecer tu contraseña.' } };
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      const listener = (state: AuthState) => {
        const session = state.user && state.token
          ? {
              access_token: state.token,
              user: {
                id: state.user.id,
                email: state.user.email,
                user_metadata: { display_name: state.user.display_name },
              },
            }
          : null;
        callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
      };
      authListeners.push(listener);

      // Initial call
      setTimeout(() => {
        const session = authState.user && authState.token
          ? {
              access_token: authState.token,
              user: {
                id: authState.user.id,
                email: authState.user.email,
                user_metadata: { display_name: authState.user.display_name },
              },
            }
          : null;
        callback('INITIAL_SESSION', session);
      }, 0);

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const idx = authListeners.indexOf(listener);
              if (idx >= 0) authListeners.splice(idx, 1);
            },
          },
        },
      };
    },
  },

  from: (table: string) => ({
    select: (columns: string = '*') => {
      const qb = new QueryBuilder(table);
      return qb.select(columns);
    },
    insert: (rows: any | any[]) => {
      const arr = Array.isArray(rows) ? rows : [rows];
      return new InsertBuilder(table, arr);
    },
    update: (values: any) => {
      return new UpdateBuilder(table, values);
    },
    delete: () => {
      return new DeleteBuilder(table);
    },
    upsert: (rows: any | any[], options?: { onConflict?: string }) => {
      const arr = Array.isArray(rows) ? rows : [rows];
      return new UpsertBuilder(table, arr, options);
    },
  }),
};

// Re-export for compatibility
export type { Database } from './types';
