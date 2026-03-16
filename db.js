/**
 npm install better-sqlite3
 node server.js
 */

const Database = require("better-sqlite3");
const path = require("path");

// SQLite database file lives next to this file
const db = new Database(path.join(__dirname, "sentinel.db"));

// Run once on startup; create table if no existing table
db.exec(`
  CREATE TABLE IF NOT EXISTS templates (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    config      TEXT    NOT NULL,   -- JSON blob of the full state object
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// public api
function saveTemplate(name, config) {
  const configJson = JSON.stringify(config);
  const now = new Date().toISOString();

  // if a template with this name exists, overwrite it
  const existing = db
    .prepare("SELECT id FROM templates WHERE name = ?")
    .get(name);

  if (existing) {
    db.prepare(
      "UPDATE templates SET config = ?, updated_at = ? WHERE id = ?"
    ).run(configJson, now, existing.id);
    return getTemplate(existing.id);
  } else {
    const result = db
      .prepare(
        "INSERT INTO templates (name, config, created_at, updated_at) VALUES (?, ?, ?, ?)"
      )
      .run(name, configJson, now, now);
    return getTemplate(result.lastInsertRowid);
  }
}

function getTemplate(id) {
  const row = db.prepare("SELECT * FROM templates WHERE id = ?").get(id);
  if (!row) return null;
  return { ...row, config: JSON.parse(row.config) };
}

function getAllTemplates() {
  return db
    .prepare(
      "SELECT id, name, created_at, updated_at FROM templates ORDER BY updated_at DESC"
    )
    .all();
}

function deleteTemplate(id) {
  const result = db.prepare("DELETE FROM templates WHERE id = ?").run(id);
  return result.changes > 0;
}

module.exports = { saveTemplate, getTemplate, getAllTemplates, deleteTemplate };


