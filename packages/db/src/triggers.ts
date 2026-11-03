import { sql } from "./connection";

import { statements } from "./progress-session-sql";

for (const statement of statements) await sql.query(statement);
console.log(`Applied ${statements.length} progress session statements.`);
