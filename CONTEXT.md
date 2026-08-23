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
A chronological, user-visible record of a person's social action, such as a
log, rating, review, library change, or Follow. It reflects the action's
current visible state: edits update its Activity and deletion removes it.
_Avoid_: heatmap activity, progress activity, notification

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
