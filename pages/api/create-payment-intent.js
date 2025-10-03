import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();
export default async function handler(req, res) {

  if (req.method !== "POST") return res.status(405).end();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: 5005, // in cents
    currency: "usd",
    automatic_payment_methods: { enabled: true },
  });

  await prisma.payment.create({
    data: {
      stripePaymentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: "pending",
      userId: 1,
    },
  });

  res.json({ clientSecret: paymentIntent.client_secret });
}
