import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const audioDir = resolve(process.cwd(), "public/audio");
  const tracks = existsSync(audioDir)
    ? readdirSync(audioDir)
        .filter((f) => /\.(wav|mp3|m4a|ogg)$/i.test(f))
        .sort()
        .map((file) => ({
          file,
          label: file.replace(/\.[^.]+$/, ""),
        }))
    : [];
  return NextResponse.json({ tracks });
}
