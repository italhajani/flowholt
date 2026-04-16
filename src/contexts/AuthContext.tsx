import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api, getCachedSession, getToken, isTokenExpired, setToken, setCachedSession, clearAuthState, type AuthSession } from "@/lib/api";

interface AuthContextValue {
  user: AuthSession["user"] | null;
  workspace: AuthSession["workspace"] | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession["user"] | null>(null);
  const [workspace, setWorkspace] = useState<AuthSession["workspace"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    if (isTokenExpired(token)) {
      clearAuthState();
      setLoading(false);
      return;
    }

    const cachedSession = getCachedSession();
    if (cachedSession) {
      setUser(cachedSession.user);
      setWorkspace(cachedSession.workspace);
      setLoading(false);
    }

    api
      .authGetSession()
      .then((session) => {
        setUser(session.user);
        setWorkspace(session.workspace);
        setCachedSession(session);
      })
      .catch(() => {
        clearAuthState();
        setUser(null);
        setWorkspace(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.authLogin(email, password);
    setToken(res.access_token);
    setUser(res.session.user);
    setWorkspace(res.session.workspace);
    setCachedSession(res.session);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.authSignup(name, email, password);
    setToken(res.access_token);
    setUser(res.session.user);
    setWorkspace(res.session.workspace);
    setCachedSession(res.session);
  }, []);

  const logout = useCallback(() => {
    clearAuthState();
    setUser(null);
    setWorkspace(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, workspace, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
