export default async function handler(req, res) {
  const isProd = process.env.NODE_ENV === "production";
  const cookie = [
    "token=",
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    isProd ? "Secure" : "",
    "Max-Age=0",
  ]
    .filter(Boolean)
    .join("; ");
  res.setHeader("Set-Cookie", cookie);
  res.status(200).json({ ok: true });
}
