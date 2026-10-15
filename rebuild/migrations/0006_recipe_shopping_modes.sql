ALTER TABLE shopping_lists ADD COLUMN revision INTEGER NOT NULL DEFAULT 0;
UPDATE recipes SET details=json_remove(details, '$.status');
