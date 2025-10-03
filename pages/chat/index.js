import { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";
import CheckoutForm from "../component/CheckoutForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Box } from "@mui/material";

const Index = () => {
  const { user, loading, fetchMe, logout } = useUser();
  const router = useRouter();
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
  useEffect(() => {
    if (!user) fetchMe();
  }, [user, fetchMe]);

  const onLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 420, maxWidth: "92vw" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: 16,
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {loading
              ? "Loading..."
              : `Welcome back, ${user?.name || user?.email}`}
          </div>
          <button
            onClick={onLogout}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "none",
              background: "#111827",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
        <Elements stripe={stripePromise}>
          <Box
            sx={{
              width: 420,
              maxWidth: "92vw",
              pt: "100px",
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              p: 2,
              backgroundColor: "white",
            }}
          >
            <CheckoutForm />
          </Box>
        </Elements>
      </div>
    </>
  );
};

export default Index;
