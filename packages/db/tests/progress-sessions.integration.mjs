// Run against a disposable database: PROGRESS_TEST_URL=... bun run tests/progress-sessions.integration.mjs
import assert from "node:assert/strict";
import pg from "pg";

import { statements } from "../src/progress-session-sql";

const connectionString = process.env.PROGRESS_TEST_URL;
if (!connectionString) throw new Error("PROGRESS_TEST_URL must point at a disposable database");
const pool = new pg.Pool({ connectionString });
try {
  await pool.query(`CREATE TYPE list_status AS ENUM ('CURRENT','COMPLETED','PAUSED');
    CREATE TABLE library(user_id text, media_id integer, media_type text, progress integer default 0, progress_date date, updated_at timestamp default now(), status list_status default 'CURRENT', PRIMARY KEY(user_id,media_id));
    CREATE TABLE media(id integer,type text,episodes integer,chapters integer);
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
  await pool.query(`UPDATE library SET progress=4 WHERE user_id='u' AND media_id=1`);
  assert.deepEqual(await totals(), [{ day: "2026-11-01", amount: 1 }]);
  assert.deepEqual(
    (
      await pool.query(
        `SELECT start_number,end_number FROM progress_session WHERE media_id=1 ORDER BY start_number`,
      )
    ).rows,
    [
      { start_number: 1, end_number: 3 },
      { start_number: 4, end_number: 4 },
    ],
  );
  await pool.query(`UPDATE library SET progress=6 WHERE user_id='u' AND media_id=1`);
  await pool.query(`UPDATE library SET progress=3 WHERE user_id='u' AND media_id=1`);
  assert.deepEqual(await totals(), []);
  await pool.query(`UPDATE library SET progress=0 WHERE user_id='u' AND media_id=1`);
  assert.equal(
    (await pool.query(`SELECT count(*)::int AS n FROM progress_session WHERE media_id=1`)).rows[0]
      .n,
    0,
  );
  await pool.query(
    `UPDATE library SET progress=3,progress_date=null WHERE user_id='u' AND media_id=1`,
  );
  await pool.query(
    `UPDATE library SET progress=6,progress_date='2026-11-01' WHERE user_id='u' AND media_id=1`,
  );
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
  for (const [titleId, type, episodes, chapters] of [
    [3, "ANIME", 12, null],
    [4, "MANGA", null, 12],
    [5, "ANIME", null, null],
    [6, "MANGA", null, 0],
  ]) {
    await pool.query("INSERT INTO media VALUES($1,$2,$3,$4)", [titleId, type, episodes, chapters]);
    await pool.query(
      "INSERT INTO library(user_id,media_id,media_type,progress) VALUES('u',$1,$2,11)",
      [titleId, type],
    );
    const sessionId = (
      await pool.query("SELECT id FROM progress_session WHERE media_id=$1", [titleId])
    ).rows[0].id;
    await pool.query("SELECT change_progress_session('u',$1,$2,1,12,null,false)", [
      titleId,
      sessionId,
    ]);
    let entry = (
      await pool.query("SELECT progress,status FROM library WHERE media_id=$1", [titleId])
    ).rows[0];
    assert.deepEqual(entry, { progress: 12, status: titleId < 5 ? "COMPLETED" : "CURRENT" });
    // Date-only edits must preserve status, even at a known total.
    await pool.query("UPDATE library SET status='PAUSED' WHERE media_id=$1", [titleId]);
    await pool.query("SELECT change_progress_session('u',$1,$2,1,12,'2026-11-01',false)", [
      titleId,
      sessionId,
    ]);
    entry = (await pool.query("SELECT status FROM library WHERE media_id=$1", [titleId])).rows[0];
    assert.equal(entry.status, "PAUSED");
  }
  console.log("Progress session integration checks passed");
} finally {
  await pool.end();
}
