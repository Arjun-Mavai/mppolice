import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.resolve('src/db/schema.ts'), 'utf8');
const header = `import {
  pgTable,
  text,
  integer,
  doublePrecision,
  index,
  uniqueIndex,
  numeric,
  primaryKey,
  serial,
  customType,
} from 'drizzle-orm/pg-core';

import { sql, relations } from 'drizzle-orm';

export const booleanMode = customType<{ data: boolean; driverData: boolean | number | string }>({
  dataType: () => 'boolean',
  fromDriver: (value) => value === true || value === 1 || value === '1' || value === 'true',
  toDriver: (value) => Boolean(value),
});

export const timestampMode = customType<{ data: Date; driverData: Date | string | number }>({
  dataType: () => 'timestamp with time zone',
  fromDriver: (value) => (value instanceof Date ? value : new Date(value)),
  toDriver: (value) => (value instanceof Date ? value.toISOString() : new Date(value).toISOString()),
});

export const jsonText = <T = unknown>(name: string) =>
  customType<{ data: T; driverData: string | unknown }>({
    dataType: () => 'jsonb',
    fromDriver: (value) => (typeof value === 'string' ? JSON.parse(value) : (value as T)),
    toDriver: (value) => JSON.stringify(value),
  })(name);

`;

let result = source
  .replace(
    /import \{ sqliteTable, text, integer, real, index, uniqueIndex(?:, numeric|, blob|, primaryKey)* \} from 'drizzle-orm\/sqlite-core';/,
    ''
  )
  .replace(/import \{ sql, relations \} from 'drizzle-orm';/, '')
  .replace(/sqliteTable\(/g, 'pgTable(')
  .replace(/real\(/g, 'doublePrecision(')
  .replace(/blob\(/g, 'text(')
  .replace(/integer\((['"][^'"]+['"]), \{ mode: 'boolean' \}\)/g, 'booleanMode($1)')
  .replace(/integer\((['"][^'"]+['"]), \{ mode: 'timestamp' \}\)/g, 'timestampMode($1)')
  .replace(/text\((['"][^'"]+['"]), \{ mode: 'json' \}\)/g, 'jsonText($1)')
  .replace(/sql`\(strftime\('%s', 'now'\)\)`/g, 'sql`now()`')
  .replace(/sql`'\[\]'`/g, `sql\`'[]'::jsonb\``)
  .replace(/integer\((['"][^'"]+['"])\)\.primaryKey\(\{ autoIncrement: true \}\)/g, 'serial($1).primaryKey()');

result = header + result;
fs.writeFileSync(path.resolve('src/db/schema.pg.ts'), result);
console.log('✅ Generated src/db/schema.pg.ts');
