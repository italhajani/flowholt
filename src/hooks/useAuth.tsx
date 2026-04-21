/**
 * Auth context — holds current user session, provides login/logout actions.
 * Supports both local auth (backend JWT) and Supabase auth (when configured).
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
import {
  isSupabaseConfigured,
  supabaseSignIn,
  supabaseSignUp,
  supabaseSignOut,
  getSupabaseToken,
} from "@/lib/supabase";

interface AuthContextValue {
  session: SessionResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authMode: "local" | "supabase";
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

  // Restore session from localStorage on mount; also check Supabase session
  useEffect(() => {
    const stored = getStoredSession();
    const storedToken = getToken();
    if (stored && storedToken) {
      setSession(stored);
      setTokenState(storedToken);
    } else if (isSupabaseConfigured) {
      // Try to restore from Supabase session
      getSupabaseToken().then(sbt => {
        if (sbt) setTokenState(sbt);
      }).catch(() => null);
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
    if (isSupabaseConfigured) {
      // Sign up via Supabase first, then let backend create workspace via Supabase JWT
      const supabaseToken = await supabaseSignUp(email, password);
      setTokenState(supabaseToken);
      // Synthetic response — backend will create workspace on first authenticated request
      return { access_token: supabaseToken, expires_at: "", session: null as unknown as SessionResponse };
    }
    const res = await apiSignup(email, password, name);
    setSession(res.session);
    setTokenState(res.access_token);
    return res;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (isSupabaseConfigured) {
      // Sign in via Supabase — get Supabase JWT, send to backend for session resolution
      const supabaseToken = await supabaseSignIn(email, password);
      setTokenState(supabaseToken);
      // Synthetic response for Supabase auth mode
      return { access_token: supabaseToken, expires_at: "", session: null as unknown as SessionResponse };
    }
    const res = await apiLogin(email, password);
    setSession(res.session);
    setTokenState(res.access_token);
    return res;
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    if (isSupabaseConfigured) supabaseSignOut().catch(() => null);
    setSession(null);
    setTokenState(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        token,
        isAuthenticated: !!token && (!!session || isSupabaseConfigured),
        isLoading,
        authMode: isSupabaseConfigured ? "supabase" : "local",
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
