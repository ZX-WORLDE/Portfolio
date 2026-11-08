import { NextRequest, NextResponse } from "next/server";
import { createReadStream, promises as fsp } from "fs";
import { Readable } from "stream";
import path from "path";
import { contentTypeFor, uploadsDir } from "@/lib/uploads";

export const runtime = "nodejs";

/**
 * Serves locally-uploaded media with Range support so <video> elements
 * can seek and stream. Filenames are opaque (timestamp-random-name),
 * so long-lived immutable caching is safe.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  if (!/^[a-zA-Z0-9._-]+$/.test(file)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const type = contentTypeFor(path.extname(file).toLowerCase());
  if (!type) return new NextResponse("Not found", { status: 404 });

  const filePath = path.join(uploadsDir(), file);
  let stat: Awaited<ReturnType<typeof fsp.stat>>;
  try {
    stat = await fsp.stat(filePath);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const range = req.headers.get("range");
  if (range) {
    const m = /bytes=(\d+)-(\d*)/.exec(range);
    if (m) {
      const start = parseInt(m[1], 10);
      const end = m[2]
        ? Math.min(parseInt(m[2], 10), stat.size - 1)
        : stat.size - 1;
      if (Number.isNaN(start) || start >= stat.size || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${stat.size}` },
        });
      }
      const stream = createReadStream(filePath, { start, end });
      return new NextResponse(
        Readable.toWeb(stream) as unknown as ReadableStream<Uint8Array>,
        {
          status: 206,
          headers: {
            "Content-Type": type,
            "Content-Length": String(end - start + 1),
            "Content-Range": `bytes ${start}-${end}/${stat.size}`,
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        }
      );
    }
  }

  const stream = createReadStream(filePath);
  return new NextResponse(
    Readable.toWeb(stream) as unknown as ReadableStream<Uint8Array>,
    {
      status: 200,
      headers: {
        "Content-Type": type,
        "Content-Length": String(stat.size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  );
}
