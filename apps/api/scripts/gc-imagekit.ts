/**
 * Garbage-collects unreferenced ImageKit uploads.
 *
 * Run manually: bun run gc:imagekit [-- --dry-run]
 * Suggested cadence: weekly.
 *
 * A file in /avatars or /banners is deleted when ALL of these hold:
 * - its path matches the server-mandated upload convention
 *   (files that don't belong to this feature are left alone)
 * - no user/profile row references its path
 * - it was uploaded more than 48h ago (grace for in-flight uploads)
 */
import { profileDal } from "@tsuki/db";
import { env } from "@tsuki/env/api";

import {
  bulkDeleteImageKitFiles,
  listImageKitFiles,
  parseImagePath,
  uploadedAtFromFilePath,
  type ImageUploadType,
} from "../src/modules/profiles/imagekit";

const GRACE_SECONDS = 48 * 60 * 60;
const FOLDERS: Array<{ folder: string; type: ImageUploadType }> = [
  { folder: "/avatars", type: "avatar" },
  { folder: "/banners", type: "banner" },
];

const dryRun = process.argv.includes("--dry-run");
const now = Math.floor(Date.now() / 1000);

if (!env.IMAGEKIT_PRIVATE_KEY) {
  console.error("IMAGEKIT_PRIVATE_KEY is not configured.");
  process.exit(1);
}

// Referenced file paths, derived from the image URLs users actually point at.
const rows = await profileDal.getProfileImageReferences();

const referenced = new Set<string>();
for (const row of rows) {
  if (row.image) {
    const path = parseImagePath(row.image, row.userId, "avatar");
    if (path) referenced.add(path);
  }
  if (row.bannerImage) {
    const path = parseImagePath(row.bannerImage, row.userId, "banner");
    if (path) referenced.add(path);
  }
}

let totalDeleted = 0;
for (const { folder } of FOLDERS) {
  const files = await listImageKitFiles(folder);
  const deletable = files.filter(({ filePath }) => {
    const uploadedAt = uploadedAtFromFilePath(filePath);
    // Only convention-conforming uploads are ours to clean.
    if (uploadedAt === null) return false;
    if (now - uploadedAt < GRACE_SECONDS) return false;
    return !referenced.has(filePath);
  });

  console.log(`${folder}: ${files.length} files, ${deletable.length} unreferenced & eligible`);
  if (deletable.length === 0 || dryRun) continue;

  const ok = await bulkDeleteImageKitFiles(deletable.map(({ fileId }) => fileId));
  if (ok) totalDeleted += deletable.length;
}

console.log(dryRun ? "Dry run — nothing deleted." : `Deleted ${totalDeleted} files.`);
