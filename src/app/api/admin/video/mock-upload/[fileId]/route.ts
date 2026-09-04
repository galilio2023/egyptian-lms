import { NextRequest, NextResponse } from "next/server";

export async function HEAD(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Upload-Offset": "1000000000",
      "Upload-Length": "1000000000",
      "Tus-Resumable": "1.0.0",
      "Access-Control-Expose-Headers": "Location, Tus-Resumable, Upload-Offset, Upload-Length",
    },
  });
}

export async function PATCH(request: NextRequest) {
  const currentOffset = request.headers.get("upload-offset") || "0";
  const body = await request.arrayBuffer().catch(() => new ArrayBuffer(0));
  const newOffset = Number(currentOffset) + body.byteLength;

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Upload-Offset": newOffset.toString(),
      "Tus-Resumable": "1.0.0",
      "Access-Control-Expose-Headers": "Location, Tus-Resumable, Upload-Offset, Upload-Length",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Tus-Resumable": "1.0.0",
      "Tus-Version": "1.0.0",
      "Access-Control-Allow-Methods": "POST, GET, HEAD, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Upload-Length, Upload-Offset, Tus-Resumable, Upload-Metadata",
      "Access-Control-Expose-Headers": "Location, Tus-Resumable, Upload-Offset, Upload-Length",
    },
  });
}
