import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

const UPLOADS_BUCKET = "uploads";

export function isNeonStorageConfigured(): boolean {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID?.trim() &&
      process.env.AWS_SECRET_ACCESS_KEY?.trim() &&
      process.env.AWS_ENDPOINT_URL_S3?.trim()
  );
}

export function getUploadsFilesClient() {
  if (!isNeonStorageConfigured()) {
    return null;
  }

  return new Files({
    adapter: neon({
      bucket: UPLOADS_BUCKET,
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
      region: process.env.AWS_REGION || "us-east-2",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }),
  });
}

function extensionFromMimeType(mimeType: string): string {
  const clean = mimeType.split(";")[0].trim().toLowerCase();
  if (clean.includes("wav")) return "wav";
  if (clean.includes("ogg")) return "ogg";
  if (clean.includes("mp4") || clean.includes("m4a")) return "m4a";
  if (clean.includes("mpeg") || clean.includes("mp3")) return "mp3";
  return "webm";
}

export async function uploadPronunciationAudio(params: {
  userId: string;
  audioBase64: string;
  mimeType: string;
}): Promise<{ key: string; url: string } | null> {
  const files = getUploadsFilesClient();
  if (!files) return null;

  const ext = extensionFromMimeType(params.mimeType);
  const key = `pronunciation/${params.userId}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(params.audioBase64, "base64");

  await files.upload(key, buffer, {
    contentType: params.mimeType.split(";")[0].trim() || "audio/webm",
  });

  const url = await files.url(key, { expiresIn: 3600 });
  return { key, url };
}

export async function getPresignedObjectUrl(
  key: string,
  expiresIn = 3600
): Promise<string | null> {
  const files = getUploadsFilesClient();
  if (!files) return null;
  return files.url(key, { expiresIn });
}

export async function deleteStoredObject(key: string): Promise<void> {
  const files = getUploadsFilesClient();
  if (!files) return;
  await files.delete(key);
}
