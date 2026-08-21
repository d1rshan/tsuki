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
The product area at `/friends` for discovering people and, later, viewing
activity from Followed users. It is available to signed-in users and does not
denote a separate relationship type.
_Avoid_: friends relationship, friendship

**Username Search**:
An authenticated, debounced prefix search over Usernames. Results omit the
viewer and let them open a Profile or change their Follow relationship.
_Avoid_: people search, name search

**Popular on Tsuki**:
The default Friends list: up to 24 users with the highest follower counts,
excluding the viewer; newer accounts break ties.
_Avoid_: recommended users, trending users
