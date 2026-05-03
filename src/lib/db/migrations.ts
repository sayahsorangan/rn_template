import {getDb} from './index';

/**
 * Run once on app start.  Safe to call multiple times — uses IF NOT EXISTS.
 */
export function runMigrations() {
  const db = getDb();

  db.executeSync(`
    CREATE TABLE IF NOT EXISTS rooms (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL DEFAULT 'New Chat',
      model_path  TEXT,
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL
    );
  `);

  db.executeSync(`
    CREATE TABLE IF NOT EXISTS messages (
      id          TEXT PRIMARY KEY,
      room_id     TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      role        TEXT NOT NULL CHECK(role IN ('user','assistant')),
      content     TEXT NOT NULL,
      created_at  INTEGER NOT NULL
    );
  `);

  db.executeSync(`
    CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id, created_at);
  `);
}
