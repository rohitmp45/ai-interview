import { NextResponse } from "next/server";

export default async function handler(req, res) {
  const { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } = process.env;

  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: "Missing GOOGLE_CLIENT_ID" });
  }

  const forwardedProto =
    req.headers["x-forwarded-proto"] ||
    (req.connection && req.connection.encrypted ? "https" : "http");
  const forwardedHost =
    req.headers["x-forwarded-host"] || req.headers.host || "";
  const baseUrl = forwardedHost ? `${forwardedProto}://${forwardedHost}` : "";

  // Prefer query origin if provided, else use computed baseUrl
  const origin = req.query.origin || baseUrl;
  const returnTo = req.query.return_to || "/chat";

  // Build redirect_uri dynamically if not provided in env
  const redirectUri =
    GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`;

  console.log("OAuth Debug Info:");
  console.log("- baseUrl:", baseUrl);
  console.log("- redirectUri:", redirectUri);
  console.log("- origin:", origin);

  const state = Buffer.from(JSON.stringify({ origin, returnTo })).toString(
    "base64url"
  );

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.writeHead(302, { Location: authorizationUrl });
  res.end();
}
