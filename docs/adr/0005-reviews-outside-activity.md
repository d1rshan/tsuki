# Reviews outside Activity

This supersedes the Review Activity portions of ADR 0002 and
`docs/activity-and-completion-spec.md`.

Activity consists only of Logs: qualifying progress increases and status changes.
Review creation, edits, and deletion no longer write or remove Activity records.
All Activity readers exclude historical Review records before pagination, including
Profile Activity. The cleanup script deletes historical Review Activity without
rebuilding it. The database enum retains its historical REVIEW value for compatibility.

Recent reviews on Social are read directly from the reviews table with full Rich
Content and author information. Public lists include only public Profiles;
Following lists include accounts the viewer currently follows. Reviews are ordered
by original publication time and have independent pagination. The Public/Following
control selects the audience for both Activity and recent reviews.
