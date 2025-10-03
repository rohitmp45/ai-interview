import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false); // track loading state

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || loading) return;

    setLoading(true); // disable button while processing

    const res = await fetch("/api/create-payment-intent", { method: "POST" });
    const { clientSecret } = await res.json();

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });
    if (result.error) {
      console.error(result.error.message);
      alert("Payment failed ");
    } else if (result.paymentIntent.status === "succeeded") {
      alert("Payment success 🎉");
    }

    setLoading(false); // re-enable button after processing
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Pay"}
      </button>
    </form>
  );
}
