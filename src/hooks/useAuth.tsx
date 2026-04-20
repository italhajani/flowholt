/**
 * Auth context — holds current user session, provides login/logout actions.
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  devLogin as apiDevLogin,
  signup as apiSignup,
  login as apiLogin,
  logout as apiLogout,
  getToken,
  getStoredSession,
  type SessionResponse,
  type AuthSessionTokenResponse,
} from "@/lib/api";

interface AuthContextValue {
  session: SessionResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  devLogin: (userId: string, workspaceId?: string) => Promise<AuthSessionTokenResponse>;
  signup: (email: string, password: string, name: string) => Promise<AuthSessionTokenResponse>;
  login: (email: string, password: string) => Promise<AuthSessionTokenResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = getStoredSession();
    const storedToken = getToken();
    if (stored && storedToken) {
      setSession(stored);
      setTokenState(storedToken);
    }
    setIsLoading(false);
  }, []);

  const devLogin = useCallback(async (userId: string, workspaceId?: string) => {
    const res = await apiDevLogin(userId, workspaceId);
    setSession(res.session);
    setTokenState(res.access_token);
    return res;
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const res = await apiSignup(email, password, name);
    setSession(res.session);
    setTokenState(res.access_token);
    return res;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setSession(res.session);
    setTokenState(res.access_token);
    return res;
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setSession(null);
    setTokenState(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        token,
        isAuthenticated: !!token && !!session,
        isLoading,
        devLogin,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
