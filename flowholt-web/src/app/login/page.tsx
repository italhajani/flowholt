import Link from "next/link";

import { login } from "@/app/auth/actions";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

const entryNotes = [
  "Open your workspace dashboard after login",
  "Jump into Studio, runs, and integrations",
  "Continue from the same saved workflows and revisions",
];

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : {};
  const error = readMessage(params.error);
  const message = readMessage(params.message);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#faf7f1_0%,#f3eee5_100%)] px-6 py-8 text-stone-950 md:px-10">
      <div className="mx-auto flex max-w-[1380px] flex-col gap-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-500">
            FlowHolt
          </Link>
          <div className="flex gap-2">
            <Link href="/signup" className="flowholt-secondary-button px-4 py-2 text-sm font-medium">
              Get started
            </Link>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-stretch">
          <section className="flowholt-window overflow-hidden">
            <div className="flowholt-window-bar">
              <div className="flowholt-window-dots">
                <span className="bg-[#fb7185]" />
                <span className="bg-[#f59e0b]" />
                <span className="bg-[#34d399]" />
              </div>
              <span className="flowholt-chip">Workspace access</span>
            </div>

            <div className="grid gap-6 p-6 sm:p-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">Login</p>
                <h1 className="flowholt-display mt-4 text-[3rem] leading-none text-stone-950 sm:text-[3.8rem]">
                  Return to the clean workflow workspace.
                </h1>
                <p className="mt-4 max-w-xl text-base leading-8 text-stone-600">
                  Sign in and continue building flows, reviewing runs, and refining the assistant-created graph in the same premium workspace.
                </p>
              </div>

              <div className="grid gap-3">
                {entryNotes.map((note) => (
                  <div key={note} className="rounded-[1.4rem] border border-stone-900/10 bg-white/82 px-4 py-4 shadow-[var(--fh-shadow-soft)]">
                    <p className="text-sm font-medium text-stone-900">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="flowholt-window px-6 py-6 sm:px-8 sm:py-8">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">Access</p>
              <h2 className="flowholt-display mt-4 text-[2.35rem] leading-none text-stone-950">
                Sign in to FlowHolt.
              </h2>
              <p className="mt-4 text-sm leading-7 text-stone-600">
                Use your email and password to enter the workspace. After sign in, FlowHolt will redirect you into the protected app.
              </p>
            </div>

            <form action={login} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-[1.35rem] border border-stone-900/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[var(--fh-accent)]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full rounded-[1.35rem] border border-stone-900/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[var(--fh-accent)]"
                />
              </div>
              {message ? (
                <p className="rounded-[1.2rem] bg-[#eef5ef] px-4 py-3 text-sm text-emerald-900">
                  {message}
                </p>
              ) : null}
              {error ? (
                <p className="rounded-[1.2rem] bg-[#f8eee4] px-4 py-3 text-sm text-amber-950">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                className="flowholt-primary-button w-full px-5 py-3.5 text-sm font-medium"
              >
                Sign in
              </button>
            </form>

            <p className="mt-5 text-sm text-stone-500">
              Need an account?{" "}
              <Link href="/signup" className="font-medium text-stone-900 underline underline-offset-4">
                Create one
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
