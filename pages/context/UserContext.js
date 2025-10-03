import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();

        if (data?.authenticated || res?.status === 200)
          setUser(data.user || res.user);
        else setUser(null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = (nextUser) => setUser(nextUser || null);

  const logout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
    } catch {}
    try {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    } catch {}
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, fetchMe, login, logout }),
    [user, loading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
