import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import cors, { runMiddleware } from "./_cors";

const prisma = new PrismaClient();

// Helper to get user from token
async function getUserFromToken(req) {
  try {
    const token = req.cookies?.token || "";
    if (!token) return null;
    const payload = jwt.verify(token, process.env.JWT_SECRET || "hel123785");
    return await prisma.user.findUnique({ where: { id: payload.userId } });
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const user = await getUserFromToken(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    if (req.method === "GET") {
      const todos = await prisma.todo.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ todos });
    }

    if (req.method === "POST") {
      const { title, description, scheduledAt } = req.body;
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      const todo = await prisma.todo.create({
        data: {
          title,
          description: description || null,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          userId: user.id,
        },
      });
      return res.status(201).json({ todo });
    }

    if (req.method === "PUT") {
      const { id, title, description, completed, scheduledAt, notified } =
        req.body;
      if (!id) {
        return res.status(400).json({ error: "Todo ID is required" });
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (completed !== undefined) updateData.completed = completed;
      if (notified !== undefined) updateData.notified = notified;
      if (scheduledAt !== undefined) {
        updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
      }

      const todo = await prisma.todo.update({
        where: { id: parseInt(id) },
        data: updateData,
      });
      return res.status(200).json({ todo });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "Todo ID is required" });
      }

      await prisma.todo.delete({
        where: { id: parseInt(id) },
      });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Todos API error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
