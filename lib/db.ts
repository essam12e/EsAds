import "server-only";

type Args = Record<string, unknown>;

let poolPromise: Promise<import("pg").Pool> | null = null;

async function pgPool() {
  if (!poolPromise) {
    poolPromise = import("pg").then(
      ({ Pool }) => new Pool({ connectionString: process.env.DATABASE_URL, max: 5 }),
    );
  }
  return poolPromise;
}

/** Calls one of the database RPC functions defined in db/schema.sql. */
export async function rpc<T>(fn: string, args: Args): Promise<T> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (url && key) {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`rpc ${fn} failed: ${res.status}`);
    return (await res.json()) as T;
  }
  if (process.env.DATABASE_URL) {
    if (!/^[a-z_]+$/.test(fn)) throw new Error("bad function name");
    const keys = Object.keys(args);
    const params = keys.map((k, i) => `${k} => $${i + 1}`).join(", ");
    const pool = await pgPool();
    const out = await pool.query(`select public.${fn}(${params}) as r`, keys.map((k) => args[k]));
    return out.rows[0].r as T;
  }
  throw new Error("DB_NOT_CONFIGURED");
}
