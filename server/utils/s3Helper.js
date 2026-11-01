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
      new ListObjectVersionsCommand({
        Bucket: BUCKET_NAME,
        Prefix: key,
      }),
    );

    // Find every version and delete marker belonging to this exact key
    const Objects = [...Versions, ...DeleteMarkers]
      .filter((v) => v.Key === key)
      .map(({ Key, VersionId }) => ({
        Key,
        VersionId,
      }));

    if (Objects.length > 0) {
      const result = await client.send(
        new DeleteObjectsCommand({
          Bucket: BUCKET_NAME,
          Delete: {
            Objects,
            Quiet: false,
          },
        }),
      );

      if (result.Errors?.length > 0) {
        throw new Error(`S3 deletion failed: ${JSON.stringify(result.Errors)}`);
      }

      console.log(`Deleted ${Objects.length} object versions: ${key}`);
    } else {
      // Delete the current object if version listing returned no versions
      await client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        }),
      );

      console.log(`Deleted object: ${key}`);
    }
  } catch (error) {
    console.error(`[Storage Delete Error] ${key}:`, error);
    throw error;
  }
};

// Batch permanently delete multiple keys from Neon Object Storage
export const deleteMultipleFromStorage = async (keys) => {
  if (!keys?.length) return;
  await Promise.all(keys.map(deleteFromStorage));
};
