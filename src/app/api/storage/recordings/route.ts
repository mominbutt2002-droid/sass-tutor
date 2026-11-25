import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessFeature } from "@/lib/quota";
import {
  deleteStoredObject,
  getPresignedObjectUrl,
  getUploadsFilesClient,
  isNeonStorageConfigured,
} from "@/lib/storage";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.tutorMessage.findMany({
    where: {
      userId: user.id,
      mode: "PRONUNCIATION",
      audioKey: { not: null },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      stage: true,
      content: true,
      audioKey: true,
      feedbackJson: true,
      createdAt: true,
    },
  });

  const recordings = await Promise.all(
    rows.map(async (row) => {
      const audioUrl =
        row.audioKey && isNeonStorageConfigured()
          ? await getPresignedObjectUrl(row.audioKey).catch(() => null)
          : null;
      return {
        ...row,
        audioUrl,
      };
    })
  );

  return NextResponse.json({
    storageConfigured: isNeonStorageConfigured(),
    recordings,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canAccessFeature(user.plan, "PRONUNCIATION")) {
    return NextResponse.json(
      { error: "PRO_PLAN_REQUIRED", feature: "PRONUNCIATION" },
      { status: 403 }
    );
  }

  const files = getUploadsFilesClient();
  if (!files) {
    return NextResponse.json(
      { error: "NEON_STORAGE_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const noteText = String(body.note || "").trim();
  const title = String(body.title || "study-note").trim().slice(0, 64);

  if (!noteText) {
    return NextResponse.json({ error: "Note text is required" }, { status: 400 });
  }

  const key = `notes/${user.id}/${Date.now()}-${title.replace(
    /[^a-zA-Z0-9_-]/g,
    "_"
  )}.txt`;

  await files.upload(key, noteText, { contentType: "text/plain; charset=utf-8" });
  const url = await files.url(key, { expiresIn: 3600 });

  return NextResponse.json({ key, url });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const row = await prisma.tutorMessage.findFirst({
    where: { id, userId: user.id },
  });

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (row.audioKey) {
    await deleteStoredObject(row.audioKey).catch(() => {});
  }

  await prisma.tutorMessage.delete({ where: { id: row.id } });
  return NextResponse.json({ deleted: true });
}
