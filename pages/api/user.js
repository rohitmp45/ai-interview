import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const token = req.cookies?.token || "";
    if (!token) return res.status(200).json({ authenticated: false });
    const payload = jwt.verify(token, process.env.JWT_SECRET || "hel123785");
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });
    if (!user) return res.status(200).json({ authenticated: false });
    res.status(200).json({ authenticated: true, user });
  } catch {
    res.status(200).json({ authenticated: false });
  }
}
