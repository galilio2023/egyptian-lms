import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const uploadLength = request.headers.get("upload-length") || "1000000";
  return new NextResponse(null, {
    status: 201,
    headers: {
      "Location": "/api/admin/video/mock-upload/upload-12345",
      "Tus-Resumable": "1.0.0",
      "Upload-Length": uploadLength,
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
      "Tus-Extension": "creation,termination",
      "Access-Control-Allow-Methods": "POST, GET, HEAD, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Upload-Length, Upload-Offset, Tus-Resumable, Upload-Metadata",
      "Access-Control-Expose-Headers": "Location, Tus-Resumable, Upload-Offset, Upload-Length",
    },
  });
}
