# Tsuki

Tsuki is a social tracking platform for anime and manga. Its social language
describes how people identify and relate to one another on the platform.

## Language

**Profile**:
The public Tsuki presence of a user, identified by their username and reached
at `tsuki.fun/<username>`.
_Avoid_: account page, user page

**Username**:
A unique, lowercased, changeable identifier used to look up and address a
Profile. Former usernames are not reserved, but names that conflict with
root application routes are reserved.
_Avoid_: handle, display username, user ID

**Display Username**:
The user-facing casing of a Username, shown in the interface while its
lowercased Username is used in profile URLs and lookup.
_Avoid_: username

**Follow**:
A one-way relationship in which one user subscribes to another user's Tsuki
activity. A mutual Follow does not create a separate relationship type.
_Avoid_: friendship, friend request

**Friends**:
The signed-in product area at `/friends` for discovering people and viewing
Activity. It does not denote a separate relationship type.
_Avoid_: friends relationship, friendship

**Activity**:
A user-visible record of a person's tracking action: a Log or a Review. It
reflects the action's current visible state: edits update its Activity and
deletion removes it. Follows are a relationship, never Activity.
_Avoid_: heatmap activity, progress activity, notification, follow activity

**Log**:
An Activity that records the state of a library entry at a point in time,
including status, score, and progress. One Log exists per entry per day;
further saves that day update it, and its timestamp reflects the latest save.
Removing the entry removes all of its Logs.
_Avoid_: feed post, progress update, library change

**Review**:
An Activity that carries the full content of a written review. One Review
exists per entry; editing it updates the Activity in place while preserving
its original date.
_Avoid_: rating, comment

**Activity Feed**:
The newest-first Activity stream in Friends. Its Following mode contains
Activity by accounts the viewer currently Follows; its Public mode contains
Activity by all users.
_Avoid_: timeline, newsfeed

**Username Search**:
An authenticated, debounced prefix search over Usernames. Results omit the
viewer and let them open a Profile or change their Follow relationship.
_Avoid_: people search, name search

**Popular on Tsuki**:
The default Friends list: up to 24 users with the highest follower counts,
excluding the viewer; newer accounts break ties.
_Avoid_: recommended users, trending users
