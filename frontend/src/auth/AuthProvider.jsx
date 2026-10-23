import { useCallback, useEffect, useMemo, useState } from "react";
import { setUnauthorizedHandler } from "../services/apiClient";
import { getCurrentUser, login as loginRequest } from "../services/auth.service";
import { clearToken, getToken, setToken } from "../utils/tokenStorage";
import { AuthContext } from "./context";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Only wait for the server when a saved session might exist.
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: loggedInUser } = await loginRequest(email, password);
    setToken(token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    if (!getToken()) return undefined;
    let cancelled = false;

    getCurrentUser()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch(() => {
        // An expired session (401) is handled by the unauthorized handler.
        // Other errors, such as the server being offline, keep the saved session.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
