import { eq, sql } from "drizzle-orm";

import { db } from "../db";
import { followRequest, social, user } from "../schema";

export const getUserByUsername = async (username: string) => {
  return db.query.user.findFirst({
    where: eq(user.username, username.toLowerCase()),
  });
};

export const setPrivacy = async (userId: string, isPrivate: boolean) => {
  const result = await db.execute(sql`
    with updated as (
      update ${user}
      set is_private = ${isPrivate}, updated_at = now()
      where ${user.id} = ${userId}
      returning is_private
    ), approved as (
      delete from ${followRequest}
      where ${followRequest.targetId} = ${userId}
        and exists(select 1 from updated where is_private = false)
      returning requester_id, target_id
    ), followed as (
      insert into ${social} (follower_id, following_id)
      select requester_id, target_id from approved
      on conflict do nothing
      returning follower_id
    )
    select is_private from updated
  `);
  return result.rows.map((row) => ({ isPrivate: row.is_private === true }));
};
