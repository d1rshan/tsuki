import { sql } from "./connection";

// One-time cleanup for docs/activity-and-completion-spec.md. Run before
// deploying the new writer. Safe to repeat: new explicit transitions survive.
await sql.transaction([
  sql.query(`DELETE FROM activity WHERE type = 'LOG' AND (
    (jsonb_typeof(snapshot->'progress') = 'number'
      AND jsonb_typeof(snapshot->'progressFrom') = 'number'
      AND snapshot->'progress' > snapshot->'progressFrom')
    OR (snapshot->'progressFrom' = 'null'::jsonb
      AND jsonb_typeof(snapshot->'progress') = 'number'
      AND snapshot->'progress' > '0'::jsonb)
    OR (snapshot ? 'statusFrom'
      AND snapshot->>'status' IN ('CURRENT', 'PLANNING', 'COMPLETED', 'DROPPED', 'PAUSED', 'REPEATING')
      AND snapshot->>'status' IS DISTINCT FROM snapshot->>'statusFrom')
  ) IS NOT TRUE`),
  sql.query(`UPDATE activity SET snapshot =
    (CASE WHEN snapshot ? 'status' THEN jsonb_build_object('status', snapshot->'status') ELSE '{}'::jsonb END)
    || (CASE WHEN snapshot ? 'statusFrom' THEN jsonb_build_object('statusFrom', snapshot->'statusFrom') ELSE '{}'::jsonb END)
    || (CASE WHEN snapshot ? 'progressFrom' THEN
      jsonb_build_object('progress', snapshot->'progress', 'progressFrom', snapshot->'progressFrom')
      ELSE '{}'::jsonb END)
    WHERE type = 'LOG'`),
  sql.query(`DELETE FROM activity WHERE type = 'REVIEW'`),
  sql.query(`INSERT INTO activity (id, actor_id, type, source_id, media_id, media_type, snapshot, occurred_at)
    SELECT 'review:' || id, user_id, 'REVIEW', media_id::text, media_id, media_type, '{}'::jsonb, created_at
    FROM reviews`),
]);
console.log("Cleaned Activity snapshots and rebuilt Review summaries.");
