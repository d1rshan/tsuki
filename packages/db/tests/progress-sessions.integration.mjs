// Run against a disposable database: PROGRESS_TEST_URL=... bun run tests/progress-sessions.integration.mjs
import assert from "node:assert/strict";
import pg from "pg";

import { statements } from "../src/progress-session-sql";

const connectionString = process.env.PROGRESS_TEST_URL;
if (!connectionString) throw new Error("PROGRESS_TEST_URL must point at a disposable database");
const pool = new pg.Pool({ connectionString });
try {
  await pool.query(`CREATE TABLE library(user_id text, media_id integer, media_type text, progress integer default 0, progress_date date, updated_at timestamp default now(), PRIMARY KEY(user_id,media_id));
    CREATE TABLE progress_session(id text PRIMARY KEY,user_id text,media_id integer,media_type text,start_number integer CHECK(start_number>0),end_number integer,activity_date date,updated_at timestamp default now(), CHECK(end_number>=start_number), FOREIGN KEY(user_id,media_id) REFERENCES library ON DELETE CASCADE);`);
  for (const statement of statements) await pool.query(statement);
  await pool.query(`INSERT INTO library VALUES('u',1,'ANIME',3,null)`);
  await pool.query(`UPDATE library SET progress=6,progress_date='2026-11-01' WHERE user_id='u'`);
  const totals = async () =>
    (
      await pool.query(
        `SELECT activity_date::text AS day,sum(end_number-start_number+1)::int AS amount FROM progress_session WHERE activity_date IS NOT NULL GROUP BY activity_date ORDER BY activity_date`,
      )
    ).rows;
  assert.deepEqual(await totals(), [{ day: "2026-11-01", amount: 3 }]);
  const id = (await pool.query(`SELECT id FROM progress_session WHERE start_number=4`)).rows[0].id;
  const change = (start, end, date, remove = false) =>
    pool.query(`SELECT change_progress_session('u',1,$1,$2,$3,$4,$5)`, [
      id,
      start,
      end,
      date,
      remove,
    ]);
  await change(4, 6, "2026-10-30");
  assert.deepEqual(await totals(), [{ day: "2026-10-30", amount: 3 }]);
  await assert.rejects(change(3, 6, "2026-10-30"));
  assert.equal((await pool.query(`SELECT progress FROM library`)).rows[0].progress, 6);
  await change(4, 5, null);
  assert.deepEqual(await totals(), []);
  assert.equal((await pool.query(`SELECT progress FROM library`)).rows[0].progress, 5);
  await change(4, 5, "2026-10-30");
  assert.deepEqual(await totals(), [{ day: "2026-10-30", amount: 2 }]);
  await change(4, 5, null, true);
  assert.equal((await pool.query(`SELECT progress FROM library`)).rows[0].progress, 3);
  const results = await Promise.allSettled([
    pool.query(`UPDATE library SET progress=8 WHERE user_id='u'`),
    pool.query(`UPDATE library SET progress=8 WHERE user_id='u'`),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 2);
  assert.equal(
    (
      await pool.query(
        `SELECT count(*)::int AS n FROM progress_session WHERE start_number=4 AND end_number=8`,
      )
    ).rows[0].n,
    1,
  );
  const remaining = (await pool.query("SELECT id,start_number,end_number FROM progress_session"))
    .rows;
  for (const row of remaining)
    await pool.query("SELECT change_progress_session('u',1,$1,null,null,null,true)", [row.id]);
  assert.equal((await pool.query("SELECT progress FROM library")).rows[0].progress, 0);
  await pool.query("INSERT INTO library VALUES('u',2,'MANGA',2,'2026-11-01')");
  await pool.query("UPDATE library SET progress=1,progress_date='2026-11-01' WHERE media_id=1");
  assert.deepEqual(
    (
      await pool.query(
        "SELECT media_type,sum(end_number-start_number+1)::int AS amount FROM progress_session GROUP BY media_type ORDER BY media_type",
      )
    ).rows,
    [
      { media_type: "ANIME", amount: 1 },
      { media_type: "MANGA", amount: 2 },
    ],
  );
  console.log("Progress session integration checks passed");
} finally {
  await pool.end();
}
