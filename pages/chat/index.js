import { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "next/router";
import CheckoutForm from "../component/CheckoutForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Box, Typography, Button } from "@mui/material";

const Index = () => {
  const { user, loading, fetchMe, logout } = useUser();
  const { theme } = useTheme();
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: { xs: "column", md: "row" },
        gap: 4,
        p: 2,
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ width: 420, maxWidth: "92vw" }}>
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            mb: 2,
            fontWeight: 700,
            color: "text.primary",
          }}
        >
          {loading
            ? "Loading..."
            : `Welcome back, ${user?.name || user?.email || "User"}`}
        </Typography>
        <Button
          onClick={onLogout}
          fullWidth
          variant="contained"
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
          }}
        >
          Logout
        </Button>
      </Box>

      <Elements stripe={stripePromise}>
        <Box
          sx={{
            width: 420,
            maxWidth: "92vw",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            p: 2,
            bgcolor: "background.paper",
          }}
        >
          <CheckoutForm />
        </Box>
      </Elements>
    </Box>
  );
};

export default Index;
