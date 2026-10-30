import { sql } from "../config/db.js";
import { deleteMultipleFromStorage } from "../utils/s3Helper.js";

// Get all descendant folder ID for a given folder including the root folder Id iteself
export const getFolderHierarchyIds = async () => {
  const descendants = await sql`
  SELECT id FROM folders 
  WHERE ${folderId} = ANY(path:: text[]) AND owner_id = ${owner.id}`;
  return [folderId, ...descendants.map((f) => f.id)];
};

// Adjust user storage quota
export const adjustUserStorage = async (userId, deltaBytes) => {
  const [user] = await sql`
  UPDATE users
  SET storage_used = GREATEST(0,storage_used + ${deltaBytes}),
  updated_at = NOW() 
  WHERE id = ${userId} RETURNING storage_used`;

  return user ? Number(user.storage_used) : null;
};
// Remove share links associated with given resource IDs.
export const cleanupShareLinks = async (fileIds = [], folderIds = []) => {
  if (fileIds.lenght === 0 && folderIds.length === 0) return;
  const allIds = [...fileIds, ...folderIds];
  await sql`
  DELETE FROM share_links WHERE resource_id = ANY(${allIds}::uuid[])`;
};

// Soft delete a folder and all its contents (recursive subfolders & files)
export const softDeleteFolderHierarchy = async (folderId, ownerId) => {
  const allFolderIds = await getFolderHierarchyIds(folderId, ownerId);
  const now = new Date();

  // Get all files IDs in the hierarchy for the share link cleanup;
  const files = await sql`
  SELECT id FROM files
  WHERE folder_id = ANY(${allFolderIds}::uuid[]) AND owner_id = ${ownerId}
  AND is_trashed = false`;

  const fileIds = files.map((f) => f.id);

  await Promise.all([
    sql`
    UPDATE folders
    SET is_trashed = true, trashed_at = ${now}, updated_at = NOW()
    WHERE id = ANY(${allFolderIds}::uuid[]) AND owner_id = ${ownerId}`,
    fileIds.length > 0
      ? sql`
    UPDATE files
    SET is_trashed = true, trashed_at = ${now}, updated_at = NOW()
    WHERE id = ANY(${fileIds}::uuid[]) AND owner_id = ${ownerId}
    `
      : Promise.resolve(),
    // Cleanup share link
    cleanupShareLinks(fileIds, allFolderIds),
  ]);
};

// Restore a folder and all its contents (recursive subFolders and files).
export const restoreFolderHierarchy = async (folderId, ownerId) => {
  const allFolderIds = await getFolderHierarchyIds(folderId, ownerId);
  await Promise.all([
    sql`
    UPDATE folders
    SET is_trashed = false,trashed_at = NULL,updated_at = NOW()
    WHERE id = ANY(${allFolderIds}::uuid[]) AND owner_id = ${ownerId}`,
    sql`
    UPDATE files
    SET is_trashed = false, trashed_at = NULL, updated_at = NOW()
    WHERE folder_id = ANY(${allFolderIds}::uuid[]) AND owner_id = ${ownerId}`,
  ]);
};

// Permanently delete a folder and all its contents (recursive subfolders and files).
export const permanentDeleteFolderHierarchy = async (folderId, ownerId) => {
  const allFolderIds = await getFolderHierarchyIds(folderId, ownerId);

  const files = await sql`
  SELECT id, s3_key, size FROM files
  WHERE folder_id = ANY(${allFolderIds}::uuid[]) AND owner_id = ${ownerId}`;

  const s3Keys = files.map((f) => f.s3_key);
  const fileIds = files.map((f) => f.s3_key);
  const totalFreedSize = files.reduce((acc, f) => acc + Number(f.size), 0);

  await Promise.all([
    s3Keys.length > 0 ? deleteMultipleFromStorage(s3Keys) : Promise.resolve(),
    cleanupShareLinks(fileIds, allFolderIds),
    fileIds.length > 0
      ? sql`DELETE FROM files WHERE id = ANY(${fileIds}::uuid[])`
      : Promise.resolve(),
    sql`DELETE FROM folders WHERE id = ANY(${allFolderIds}::uuid[])`,
  ]);

  if (totalFreedSize > 0) {
    await adjustUserStorage(ownerId, -totalFreedSize);
  }
};
