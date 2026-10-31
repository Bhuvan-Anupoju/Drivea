import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectVersionsCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { BUCKET_NAME, client } from "../config/s3.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Upload file to  Neon object storage
export const uploadToStorage = async (fileBuffer, key, mimiType) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimiType,
  });
  await client.send(command);
  return { s3Key: key };
};

// Get presigned download/preview UTL for a file (valid for 10 hour)
export const getSignedFileUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  return await getSignedUrl(client, command, { expiresIn: 36000 });
};

// Permanently dele an object and its version from Neon object storage
export const deleteFromStorage = async (key) => {
  if (!key) return;
  try {
    const { Versions = [], DeleteMarkers = [] } = await client.send(
      new ListObjectVersionsCommand({ Bucket: BUCKET_NAME, Prefix: key }),
    );
    const Objects = [...Versions, ...DeleteMarkers]
      .filter((v) => v.Key === key)
      .map(({ key, VersionId }) => ({ key, VersionId }));

    if (Objects.length > 0) {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: BUCKET_NAME,
          Delete: {
            Objects,
          },
        }),
      );
    } else {
      await client.send(
        new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }),
      );
    }
  } catch (err) {
    try {
      await client.send(
        new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }),
      );
    } catch (fallbackErr) {
      console.error("[Storage Delete Error]:", fallbackErr.message);
    }
  }
};

// Batch permanently delete multiple keys from Neon Object Storage
export const deleteMultipleFromStorage = async (keys) => {
  if (!keys?.length) return;
  await Promise.all(keys.map(deleteFromStorage));
};
