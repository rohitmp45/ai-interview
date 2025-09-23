import { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Stack,
  IconButton,
} from "@mui/material";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Signup() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await axios.post("/api/signup", form);
      router.push("/login");
      setMsg(res.data.message);
    } catch (err) {
      setMsg(err.response?.data?.error || "Something went wrong");
    }
  };

  const startGoogle = () => {
    const origin = window.location.origin;
    const returnTo = "/chat";
    const url = `/api/auth/google?origin=${encodeURIComponent(
      origin
    )}&return_to=${encodeURIComponent(returnTo)}`;
    window.location.href = url;
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        px={2}
        gap={1.5}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 480,
            borderRadius: 6,
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
            backdropFilter: "blur(6px)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box textAlign="center" mb={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(180deg,#eef6ff,#e7f0ff)",

                  mx: "auto",
                  mb: 1.5,
                }}
              >
                <Icon
                  icon="solar:user-plus-bold-duotone"
                  width="26"
                  height="26"
                />
              </Box>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                Create your account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join and start chatting in minutes
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                placeholder="you@example.com"
                name="email"
                type="email"
                margin="normal"
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon icon="solar:letter-bold-duotone" width="18" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Password"
                placeholder="Create a strong password"
                name="password"
                type={showPassword ? "text" : "password"}
                margin="normal"
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon icon="solar:lock-keyhole-bold-duotone" width="18" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((s) => !s)}
                      >
                        <Icon
                          icon={
                            showPassword
                              ? "solar:eye-closed-bold-duotone"
                              : "solar:eye-bold-duotone"
                          }
                          width="18"
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                sx={{
                  mt: 2,
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  background:
                    "linear-gradient(180deg,#1f2937 0%, #111827 100%)",
                }}
              >
                Create account
              </Button>

              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                mt={2}
              >
                <Typography variant="body2" color="text.secondary">
                  Already have an account?
                </Typography>
                <Button variant="text" onClick={() => router.push("/login")}>
                  {" "}
                  Login
                </Button>
              </Stack>
            </form>

            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary">
                or
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              onClick={startGoogle}
              sx={{
                py: 1.1,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                gap: 1,
              }}
              startIcon={
                <Icon icon="logos:google-icon" width="18" height="18" />
              }
            >
              Continue with Google
            </Button>

            {msg && (
              <Typography
                mt={2}
                color={msg.includes("created") ? "primary" : "error"}
                textAlign="center"
              >
                {msg}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
