import crypto from "crypto";

export interface BunnyUploadTicket {
  success: boolean;
  provider: "bunny";
  videoId: string;
  uploadEndpoint: string;
  headers: Record<string, string>;
  expiresAt: number;
  isDemoMode?: boolean;
}

export interface BunnyVideoStatus {
  status: number; // 0: Created, 1: Uploaded, 2: Processing, 3: Transcoding, 4: Finished, 5: Error
  statusText: string;
  encodeProgress: number;
  duration: number;
  viewsCount: number;
  hasAudio: boolean;
}

const BUNNY_API_KEY = process.env.BUNNY_STREAM_API_KEY || "";
const BUNNY_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID || "";
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_STREAM_CDN_HOSTNAME || "";
const BUNNY_TOKEN_KEY = process.env.BUNNY_TOKEN_SECURITY_KEY || "";

/**
 * Returns true if Bunny.net Stream credentials are configured
 */
export function isBunnyConfigured(): boolean {
  return Boolean(BUNNY_API_KEY && BUNNY_LIBRARY_ID);
}

/**
 * Creates a new video object in Bunny Stream Library
 */
export async function createBunnyVideo(title: string): Promise<{ guid: string; title: string }> {
  if (!isBunnyConfigured()) {
    // Return a mock GUID for local development/testing without credentials
    const mockGuid = `mock-bunny-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    return {
      guid: mockGuid,
      title,
    };
  }

  const response = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`, {
    method: "POST",
    headers: {
      AccessKey: BUNNY_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      title: title.trim(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bunny Stream API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    guid: data.guid,
    title: data.title,
  };
}

/**
 * Generates an authorized TUS resumable upload ticket for direct client-to-Bunny upload
 */
export function generateBunnyUploadTicket(videoId: string): BunnyUploadTicket {
  const isDemo = !isBunnyConfigured();
  const expiresAt = Math.floor(Date.now() / 1000) + 86400; // 24 hours validity

  if (isDemo) {
    return {
      success: true,
      provider: "bunny",
      videoId,
      uploadEndpoint: "/api/admin/video/mock-upload",
      headers: {
        "x-mock-demo": "true",
      },
      expiresAt,
      isDemoMode: true,
    };
  }

  // SHA256(libraryId + apiKey + expirationTime + videoId)
  const hashString = `${BUNNY_LIBRARY_ID}${BUNNY_API_KEY}${expiresAt}${videoId}`;
  const signature = crypto.createHash("sha256").update(hashString).digest("hex");

  return {
    success: true,
    provider: "bunny",
    videoId,
    uploadEndpoint: "https://video.bunnycdn.com/tusupload",
    headers: {
      AuthorizationSignature: signature,
      AuthorizationExpire: expiresAt.toString(),
      VideoId: videoId,
      LibraryId: BUNNY_LIBRARY_ID,
    },
    expiresAt,
    isDemoMode: false,
  };
}

/**
 * Generates a signed, time-limited playback URL for HLS streaming (.m3u8)
 * Protects against URL sharing and Telegram/piracy leeching.
 */
export function generateBunnyPlaybackUrl({
  provider = "bunny",
  videoId,
  clientIp,
  expiresInSeconds = 7200, // 2 hours by default
}: {
  provider?: string;
  videoId?: string | null;
  clientIp?: string;
  expiresInSeconds?: number;
}): string {
  // If no videoId is provided, fallback to standard test HLS stream
  if (!videoId || videoId.trim() === "") {
    return "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
  }

  // If videoId is already a full external URL (e.g. Mux, Cloudflare, direct CDN link)
  if (videoId.startsWith("http://") || videoId.startsWith("https://")) {
    return videoId;
  }

  // If Bunny hostname is configured
  const hostname = BUNNY_CDN_HOSTNAME || `vz-library-${BUNNY_LIBRARY_ID || "demo"}.b-cdn.net`;
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;

  // If token authentication key is set, generate SHA-256 DRM token
  if (BUNNY_TOKEN_KEY) {
    // Bunny Stream token: sha256(tokenSecurityKey + videoId + expires + (ip ? ip : ''))
    const baseToHash = clientIp
      ? `${BUNNY_TOKEN_KEY}${videoId}${expires}${clientIp}`
      : `${BUNNY_TOKEN_KEY}${videoId}${expires}`;

    const token = crypto.createHash("sha256").update(baseToHash).digest("hex");
    return `https://${hostname}/${videoId}/playlist.m3u8?token=${token}&expires=${expires}`;
  }

  // Without token key, return direct HLS playlist URL on the pull zone
  return `https://${hostname}/${videoId}/playlist.m3u8`;
}

/**
 * Fetches video encoding and transcoding status from Bunny Stream API
 */
export async function getBunnyVideoStatus(videoId: string): Promise<BunnyVideoStatus | null> {
  if (!isBunnyConfigured()) {
    // Return ready status in mock mode
    return {
      status: 4,
      statusText: "جاهز للمشاهدة (نمط المحاكاة)",
      encodeProgress: 100,
      duration: 1200,
      viewsCount: 0,
      hasAudio: true,
    };
  }

  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
      {
        headers: {
          AccessKey: BUNNY_API_KEY,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const statusMap: Record<number, string> = {
      0: "تم إنشاء السجل بانتظار الرفع",
      1: "تم الرفع بانتظار المعالجة",
      2: "جاري المعالجة المبدئية",
      3: "جاري التشفير والتقسيم لجودات متعددة (Transcoding)",
      4: "جاهز للمشاهدة بجودة عالية",
      5: "حدث خطأ في تشفير الفيديو",
    };

    return {
      status: data.status,
      statusText: statusMap[data.status] || "حالة غير معروفة",
      encodeProgress: data.encodeProgress || (data.status === 4 ? 100 : 0),
      duration: data.length || 0,
      viewsCount: data.views || 0,
      hasAudio: data.hasAudio ?? true,
    };
  } catch (err) {
    console.error("Failed to query Bunny video status:", err);
    return null;
  }
}
