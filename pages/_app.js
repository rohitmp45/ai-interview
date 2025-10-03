import "@/styles/globals.css";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import { useRouter } from "next/router"; // Correct import

// MUI and Emotion Imports
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import theme from "./layout/theme";

// Your Existing Imports
import { UserProvider, useUser } from "./context/UserContext";
import createEmotionCache from "./utils/createEmotionCache";
import LoadingSkeleton from "./component/LoadingSkeleton";

const routeMeta = {
  "/login": "public",
  "/signup": "public",
  "/chat": "private",
  "/": "hybrid",
};

// ✅ FULLY CORRECTED GUARD COMPONENT
function Guard({ children }) {
  const router = useRouter();
  const { pathname } = router; // Get pathname from the router
  const { user, loading } = useUser();
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    if (loading) return;

    // Use the pathname from the router here too
    const type = routeMeta[pathname] || "hybrid";

    if (type === "private" && !user) {
      router.replace("/login");
      setAllowed(false);
      return;
    }
    if (type === "public" && user) {
      router.replace("/chat");
      setAllowed(false);
      return;
    }
    setAllowed(true);
  }, [user, loading, pathname]); // Add pathname to dependency array

  if (loading || !allowed) {
    return <LoadingSkeleton open />;
  }

  // Use the pathname from the router for rendering logic
  const isLoginOrSignup = pathname === "/login" || pathname === "/signup";

  if (isLoginOrSignup) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #cfe9ff 0%, #eaf4ff 40%, #ffffff 100%)",
        }}
      >
        {children}
      </div>
    );
  }

  return children;
}

Guard.propTypes = {
  children: PropTypes.node,
};

const clientSideEmotionCache = createEmotionCache();

export default function App(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UserProvider>
          <Guard>
            <Component {...pageProps} />
          </Guard>
        </UserProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};
