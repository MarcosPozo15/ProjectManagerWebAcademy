import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export type StoredUpload = {
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  relativePath: string;
};

export async function storeSubmissionFile(params: {
  submissionId: string;
  file: File;
}): Promise<StoredUpload> {
  const arrayBuffer = await params.file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadsRoot = path.join(process.cwd(), "uploads", "submissions", params.submissionId);
  await mkdir(uploadsRoot, { recursive: true });

  const safeOriginal = params.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storedName = `${randomUUID()}_${safeOriginal}`;
  const absolutePath = path.join(uploadsRoot, storedName);
  await writeFile(absolutePath, buffer);

  const relativePath = path.join("uploads", "submissions", params.submissionId, storedName);

  return {
    originalName: params.file.name,
    storedName,
    mimeType: params.file.type || "application/octet-stream",
    size: buffer.length,
    relativePath,
  };
}
