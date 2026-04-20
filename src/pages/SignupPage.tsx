import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

function OAuthButton({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-700 transition-all duration-150 hover:bg-zinc-50 hover:border-zinc-300"
    >
      {icon}
      {label}
    </button>
  );
}

export function SignupPage() {
  const [showEmail, setShowEmail] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate("/home", { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!/\d/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }

    setLoading(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim() || email.split("@")[0];
      await signup(email, password, fullName);
      navigate("/onboarding", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-1 text-[20px] font-semibold text-zinc-900">Create your account</h2>
      <p className="mb-6 text-[13px] text-zinc-500">
        Start automating with FlowHolt — free forever.
      </p>

      {/* OAuth providers */}
      <div className="flex flex-col gap-2.5">
        <OAuthButton
          label="Sign up with Google"
          icon={<svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>}
        />
        <OAuthButton
          label="Sign up with GitHub"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>}
        />
      </div>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 border-t border-zinc-200" />
        <span className="text-[11px] text-zinc-400">or</span>
        <div className="flex-1 border-t border-zinc-200" />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] text-red-700">
          {error}
        </div>
      )}

      {showEmail ? (
        <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-zinc-700">First name</label>
              <Input type="text" placeholder="Gouhar" autoFocus value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-zinc-700">Last name</label>
              <Input type="text" placeholder="Ali" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-zinc-700">Work email</label>
            <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-zinc-700">Password</label>
            <Input type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <p className="mt-1 text-[10px] text-zinc-400">Must be at least 8 characters with one number.</p>
          </div>
          <Button type="submit" variant="primary" size="md" className="mt-1 w-full" disabled={loading}>
            {loading ? <><Loader2 size={14} className="animate-spin mr-1.5" /> Creating account…</> : "Create account"}
          </Button>
        </form>
      ) : (
        <button
          onClick={() => setShowEmail(true)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-700 transition-all duration-150 hover:bg-zinc-50 hover:border-zinc-300"
        >
          Sign up with email
        </button>
      )}

      <p className="mt-5 text-center text-[12px] text-zinc-400">
        Already have an account?{" "}
        <a href="#/auth/login" className="font-medium text-zinc-700 hover:text-zinc-900 transition-colors">
          Sign in
        </a>
      </p>

      <p className="mt-4 text-center text-[10px] text-zinc-300 leading-relaxed">
        By creating an account, you agree to FlowHolt's{" "}
        <span className="underline cursor-pointer hover:text-zinc-500">Terms of Service</span> and{" "}
        <span className="underline cursor-pointer hover:text-zinc-500">Privacy Policy</span>.
      </p>
    </div>
  );
}
