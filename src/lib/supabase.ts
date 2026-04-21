/**
 * Supabase client — optional integration.
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env to enable.
 * When not configured, Supabase auth is disabled and local auth is used instead.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

/** Supabase client — null when not configured */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

/**
 * Sign in with email/password via Supabase.
 * Returns the access_token (JWT) to use in Authorization headers.
 */
export async function supabaseSignIn(email: string, password: string): Promise<string> {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (!data.session?.access_token) throw new Error("No session token returned");
  return data.session.access_token;
}

/**
 * Sign up with email/password via Supabase.
 * Returns the access_token (JWT) to use in Authorization headers.
 */
export async function supabaseSignUp(email: string, password: string): Promise<string> {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  if (!data.session?.access_token) throw new Error("Supabase signup succeeded but no session — check your email for confirmation link");
  return data.session.access_token;
}

/**
 * Sign in with OAuth provider (Google, GitHub, etc.)
 * Redirects the browser to the OAuth provider.
 */
export async function supabaseOAuthSignIn(provider: "google" | "github" | "discord" | "slack"): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw new Error(error.message);
}

/**
 * Sign out from Supabase.
 */
export async function supabaseSignOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Get the current Supabase session token (if signed in).
 */
export async function getSupabaseToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
