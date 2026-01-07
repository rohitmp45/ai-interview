import "@/styles/globals.css";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import { useRouter } from "next/router"; // Correct import

// MUI and Emotion Imports
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";

// Your Existing Imports
import { UserProvider, useUser } from "./context/UserContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import createEmotionCache from "./utils/createEmotionCache";
import LoadingSkeleton from "./component/LoadingSkeleton";
import ThemeToggle from "./component/ThemeToggle";

const routeMeta = {
  "/login": "public",
  "/signup": "public",
  "/chat": "private",
  "/": "hybrid",
};

// ✅ FULLY CORRECTED GUARD COMPONENT
function Guard({ children }) {
  const router = useRouter();
  const { pathname } = router;
  const { user, loading } = useUser();
  const { mode } = useTheme();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return;

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
  }, [user, loading, pathname, router]);

  if (loading || !allowed) {
    return <LoadingSkeleton open />;
  }

  const isLoginOrSignup = pathname === "/login" || pathname === "/signup";

  if (isLoginOrSignup) {
    // Theme-aware background for login/signup pages
    const backgroundStyle =
      mode === "dark"
        ? {
            minHeight: "100vh",
            background:
              "linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f172a 100%)",
          }
        : {
            minHeight: "100vh",
            background:
              "linear-gradient(180deg, #cfe9ff 0%, #eaf4ff 40%, #ffffff 100%)",
          };

    return <div style={backgroundStyle}>{children}</div>;
  }

  return children;
}

Guard.propTypes = {
  children: PropTypes.node,
};

const clientSideEmotionCache = createEmotionCache();

function AppWithTheme({ Component, pageProps }) {
  const { theme } = useTheme();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <Guard>
          <Component {...pageProps} />
          <ThemeToggle />
        </Guard>
      </UserProvider>
    </MuiThemeProvider>
  );
}

export default function App(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider>
        <AppWithTheme Component={Component} pageProps={pageProps} />
      </ThemeProvider>
    </CacheProvider>
  );
}

AppWithTheme.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};
