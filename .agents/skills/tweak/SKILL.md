---
name: tweak
description: Fix UI issues in one draft PR with an interactive Codex agent.
---

# Tweak

Handle all requested issues in one draft PR.

1. Choose a branch and unique agent name. Run `scripts/start.sh <branch> <agent-name>` from the project checkout.
2. Use `herdr agent prompt <agent-name> <prompt>` to request the fixes, verification, commit, push, and one draft PR against the appropriate base.
3. Include screenshots or video only when requested. Tell the agent to capture before/after proof using `playwright-cli screenshot` or `playwright-cli video-start` and `video-stop`, then attach it with `gh pr create --attach`. Arrange before/after proof in a markdown table. Report any missing proof.
4. Report the workspace and agent name.

Keep the workspace, agent, and Treehouse lease for follow-up work.
