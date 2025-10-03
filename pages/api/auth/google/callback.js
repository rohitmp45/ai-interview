import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { code, state: stateParam } = req.query;
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } =
    process.env;

  if (!code) return res.status(400).json({ error: "Missing code" });
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: "Missing Google OAuth env vars" });
  }

  let state = { origin: "", returnTo: "/chat" };
  if (stateParam) {
    try {
      state = JSON.parse(Buffer.from(stateParam, "base64url").toString("utf8"));
    } catch (_) {}
  }

  // Build redirect_uri dynamically when behind a proxy (e.g., ngrok)
  const forwardedProto =
    req.headers["x-forwarded-proto"] ||
    (req.connection && req.connection.encrypted ? "https" : "http");
  const forwardedHost =
    req.headers["x-forwarded-host"] || req.headers.host || "";
  const baseUrl = forwardedHost ? `${forwardedProto}://${forwardedHost}` : "";
  const redirectUri =
    GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      return res
        .status(400)
        .json({ error: "Token exchange failed", details: tokens });
    }

    const userInfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );
    const profile = await userInfoRes.json();
    if (!userInfoRes.ok) {
      return res
        .status(400)
        .json({ error: "Failed to fetch user info", details: profile });
    }

    const email = profile.email?.toLowerCase();
    if (!email)
      return res
        .status(400)
        .json({ error: "Email not found in Google profile" });

    const googleId = profile.sub;
    const name =
      profile.name ||
      `${profile.given_name || ""} ${profile.family_name || ""}`.trim();
    const avatarUrl = profile.picture || null;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          name,
          avatarUrl,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || googleId,
          name: name || user.name,
          avatarUrl: avatarUrl || user.avatarUrl,
        },
      });
    }

    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "hel123785",
      { expiresIn: "24h" }
    );

    const isProd = process.env.NODE_ENV === "production";
    const cookie = [
      `token=${jwtToken}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      isProd ? "Secure" : "",
      `Max-Age=${60 * 60 * 24}`,
    ]
      .filter(Boolean)
      .join("; ");

    res.setHeader("Set-Cookie", cookie);

    const safeOrigin =
      state.origin && /^https?:\/\/[a-zA-Z0-9\-\.:]+$/.test(state.origin)
        ? state.origin
        : baseUrl; // fallback to computed baseUrl so we stay on ngrok domain
    const redirectUrl = safeOrigin
      ? `${safeOrigin}${state.returnTo || "/chat"}`
      : state.returnTo || "/chat";

    res.writeHead(302, { Location: redirectUrl });
    res.end();
  } catch (err) {
    console.error("Google OAuth callback error", err);
    return res
      .status(500)
      .json({ error: "Internal Server Error Google OAuth " });
  }
}
