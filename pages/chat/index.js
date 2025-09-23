import { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/router";

const Index = () => {
  const { user, loading, fetchMe, logout } = useUser();
  const router = useRouter();

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
            {loading ? "Loading..." : `Welcome back, ${user?.name || user?.email}`}
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
      </div>
    </>
  );
};

export default Index;
