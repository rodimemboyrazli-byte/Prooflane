import "server-only";

import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

declare global {
  var prooflaneDatabase: Database.Database | undefined;
}

function databasePath() {
  const configured = process.env.DATABASE_PATH;
  if (!configured) return join(process.cwd(), "data", "prooflane.db");
  return resolve(/* turbopackIgnore: true */ configured);
}

function applyMigrations(database: Database.Database) {
  database.exec("CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
  const migrationsPath = join(process.cwd(), "db", "migrations");
  const migrations = readdirSync(migrationsPath).filter((file) => file.endsWith(".sql")).sort();
  const applied = database.prepare("SELECT filename FROM schema_migrations WHERE filename = ?");
  const record = database.prepare("INSERT INTO schema_migrations (filename, applied_at) VALUES (?, ?)");

  for (const filename of migrations) {
    if (applied.get(filename)) continue;
    const sql = readFileSync(join(migrationsPath, filename), "utf8");
    database.transaction(() => {
      database.exec(sql);
      record.run(filename, new Date().toISOString());
    })();
  }
  database.pragma("optimize");
}

export function db() {
  if (global.prooflaneDatabase) {
    applyMigrations(global.prooflaneDatabase);
    return global.prooflaneDatabase;
  }
  const path = databasePath();
  if (!existsSync(dirname(path))) mkdirSync(dirname(path), { recursive: true });
  const database = new Database(path);
  database.pragma("foreign_keys = ON");
  database.pragma("journal_mode = WAL");
  database.pragma("busy_timeout = 5000");
  applyMigrations(database);
  global.prooflaneDatabase = database;
  return database;
}
