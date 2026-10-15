ALTER TABLE recipes ADD COLUMN details TEXT NOT NULL DEFAULT '{}';
ALTER TABLE recipes ADD COLUMN source_archive TEXT NOT NULL DEFAULT '{}';
CREATE TABLE shopping_lists (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  details TEXT NOT NULL,
  source_archive TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE recipe_sheet_imports (
  source_key TEXT PRIMARY KEY,
  target_id TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK(kind IN ('recipe','shopping-list')),
  source_hash TEXT NOT NULL,
  imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
