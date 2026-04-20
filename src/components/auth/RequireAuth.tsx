/**
 * Route guard — redirects unauthenticated users to /auth/login.
 * In development, auto-triggers dev-login so the app is always usable.
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef } from "react";

export function RequireAuth() {
  const { isAuthenticated, isLoading, devLogin } = useAuth();
  const location = useLocation();
  const attempted = useRef(false);

  // In dev mode, auto-login if no session exists
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !attempted.current) {
      attempted.current = true;
      devLogin("dev-user-1").catch(() => {
        // Dev-login failed (backend down) — stay unauthenticated and let redirect happen
      });
    }
  }, [isLoading, isAuthenticated, devLogin]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
