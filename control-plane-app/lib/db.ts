import postgres from "postgres";

let client: ReturnType<typeof postgres> | null = null;

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL_NOT_CONFIGURED");

  if (!client) {
    client = postgres(url, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }

  return client;
}
