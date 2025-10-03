// pages/api/signup.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import cors, { runMiddleware } from './_cors';
import { CleaningServices } from '@mui/icons-material';
import { CLOSING } from 'ws';

const prisma = new PrismaClient();

export default async function handler(req, res) {


  // Run CORS middleware
  await runMiddleware(req, res, cors);
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if user exists
    
const existingUser = await prisma.user.findUnique({ where: { email } });
if (existingUser) {
  return res.status(400).json({ error: 'User already exists' });
}
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ message: 'User created', userId: newUser.id });
  } catch (error) {
    console.error('Error in signup:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
