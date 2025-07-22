// // pages/api/signup.js
// import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcrypt';
// import cors, { runMiddleware } from '../src/pages/api/_cors';
 
// const prisma = new PrismaClient();

// export default async function handler(req, res) {

//   console.log('Using DATABASE_URL:', process.env.DATABASE_URL);

//   // Run CORS middleware
//  const result = await runMiddleware(req, res, cors);
//  console.log('result',result);
//   console.log('req.method',req.method);
//   // Handle preflight requests
//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }
  
//   if (req.method !== 'POST') return res.status(405).end();

//   const { email, password, fullName } = req.body;

//   if (!email || !password || !fullName) {
//     return res.status(400).json({ error: 'Email, password, and full name are required' });
//   }

//   if (typeof fullName !== 'string' || fullName.trim().length === 0) {
//     return res.status(400).json({ error: 'Full name must be a non-empty string' });
//   }

//   try {
//     // Check if user exists
    
// const existingUser = await prisma.user.findUnique({ where: { email } });
// if (existingUser) {
//   return res.status(400).json({ error: 'User already exists' });
// }
//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Store user
//     const newUser = await prisma.user.create({
//       data: {
//         email,
//         password: hashedPassword,
//         fullName,
//       },
//     });
//     console.log('newUser123',newUser);

//     return res.status(201).json({ message: 'User created', userId: newUser.id });
//   } catch (error) {
//     console.error('Error in signup:', error);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// }
