import { sql } from "./connection";

// pg_trgm must exist before `drizzle-kit push` creates the generated-column
// index it references (see media_title_search_trgm_idx in schema/tables/media.ts).
const statements = [`CREATE EXTENSION IF NOT EXISTS pg_trgm;`];

for (const statement of statements) {
  await sql.query(statement);
}
console.log(`Applied ${statements.length} search-index statements.`);
