import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProvidersPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const section = searchParams.get("section");

  if (searchParams.has("code") || searchParams.has("state") || section === "oauth") {
    const nextParams = new URLSearchParams();
    nextParams.set("tab", "connections");

    const provider = searchParams.get("provider");
    if (provider) {
      nextParams.set("provider", provider);
    }

    if (searchParams.has("code")) {
      nextParams.set("code", searchParams.get("code") || "");
    }
    if (searchParams.has("state")) {
      nextParams.set("state", searchParams.get("state") || "");
    }

    if (!searchParams.has("code") && !searchParams.has("state")) {
      nextParams.set("connect", "1");
    }

    return <Navigate to={`/dashboard/credentials?${nextParams.toString()}`} replace />;
  }

  if (section === "sandbox") {
    return <Navigate to="/dashboard/api" replace />;
  }

  return <Navigate to="/dashboard/credentials?tab=credentials" replace />;
};

export default ProvidersPage;