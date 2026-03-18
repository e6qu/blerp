import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "uploads", "avatars");

function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function uploadAvatar(req: Request, res: Response) {
  try {
    const { image } = req.body;

    if (!image || typeof image !== "string") {
      res.status(400).json({ error: { message: "image field is required (base64 data URL)" } });
      return;
    }

    // Validate it's a data URL
    const match = image.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/);
    if (!match) {
      res
        .status(400)
        .json({ error: { message: "Invalid image format. Expected base64 data URL." } });
      return;
    }

    const ext = match[1] === "jpeg" ? "jpg" : match[1];
    const data = match[2];
    const filename = `${randomUUID()}.${ext}`;

    ensureUploadDir();
    writeFileSync(join(UPLOAD_DIR, filename), Buffer.from(data, "base64"));

    const url = `/uploads/avatars/${filename}`;
    res.status(201).json({ url });
  } catch (error) {
    res.status(500).json({ error: { message: (error as Error).message } });
  }
}
