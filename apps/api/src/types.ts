/**
 * Public type surface for consumers of this API.
 *
 * Importing from here rather than reaching into src/modules/** keeps the folder
 * layout an implementation detail, so modules can move without breaking the web app.
 */

export type { ApiMediaType as MediaType, Media, MediaCompact } from "./modules/media/model";
export type { LibraryEntry, ListStatus } from "./modules/library/model";
export type { Review } from "./modules/reviews/model";
export type { Profile, UserOverview } from "./modules/users/model";
