import { useEffect, useState } from "react";
import Head from "next/head";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "next/router";
import CheckoutForm from "../component/CheckoutForm";
import TodoApp from "../component/TodoApp";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Box, Typography, Button, Tabs, Tab } from "@mui/material";
import { Icon } from "@iconify/react";
import VoiceTitle from "../../component/VoiceTitle";

const Index = () => {
  const { user, loading, fetchMe, logout } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
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
      <Head>
        <title>Task Manager - Dashboard</title>
        <meta
          name="description"
          content="Manage your tasks and track your productivity"
        />
      </Head>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          p: 2,
          bgcolor: "background.default",
        }}
      >
        {/* Header - Fixed to avoid overlap with dark mode button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            pr: { xs: 0, sm: 10 }, // Add right padding to avoid dark mode button
            flexWrap: "wrap",
            gap: 2,
          }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                {loading
                  ? "Loading..."
                  : `Welcome back, ${user?.name || user?.email || "User"}`}
              </Typography>
              <VoiceTitle />
            </Box>
            <Button
              onClick={onLogout}
              variant="contained"
              startIcon={<Icon icon="solar:logout-2-bold" width={20} />}
              sx={{
                py: 1,
                px: 3,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              Logout
            </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
          >
            <Tab label="Tasks" />
            <Tab label="Payment" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
            <TodoApp />
          </Box>
        )}

        {tabValue === 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
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
        )}
      </Box>
    </>
  );
};

export default Index;
