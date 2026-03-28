import Link from "next/link";

import { signup } from "@/app/auth/actions";

type SignupPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

const starterPromises = [
  "A calmer post-login workspace",
  "Assistant-led flow drafting",
  "Premium Studio editing and resources",
];

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = searchParams ? await searchParams : {};
  const error = readMessage(params.error);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#faf7f1_0%,#f3eee5_100%)] px-6 py-8 text-stone-950 md:px-10">
      <div className="mx-auto flex max-w-[1380px] flex-col gap-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-500">
            FlowHolt
          </Link>
          <div className="flex gap-2">
            <Link href="/login" className="flowholt-secondary-button px-4 py-2 text-sm font-medium">
              Log in
            </Link>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[0.96fr_1.04fr] xl:items-stretch">
          <section className="flowholt-window px-6 py-6 sm:px-8 sm:py-8">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">Get started</p>
              <h1 className="flowholt-display mt-4 text-[3rem] leading-none text-stone-950 sm:text-[3.8rem]">
                Create your FlowHolt account.
              </h1>
              <p className="mt-4 text-base leading-8 text-stone-600">
                Start with email and password today, then move straight into workspace creation and your first assistant-built workflow.
              </p>
            </div>

            <form action={signup} className="mt-8 grid gap-5 md:max-w-xl">
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
                  minLength={8}
                  className="w-full rounded-[1.35rem] border border-stone-900/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[var(--fh-accent)]"
                />
              </div>
              {error ? (
                <p className="rounded-[1.2rem] bg-[#f8eee4] px-4 py-3 text-sm text-amber-950">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                className="flowholt-primary-button px-5 py-3.5 text-sm font-medium"
              >
                Create account
              </button>
              <p className="text-sm text-stone-500">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-stone-900 underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </form>
          </section>

          <section className="flowholt-window overflow-hidden">
            <div className="flowholt-window-bar">
              <div className="flowholt-window-dots">
                <span className="bg-[#fb7185]" />
                <span className="bg-[#f59e0b]" />
                <span className="bg-[#34d399]" />
              </div>
              <span className="flowholt-chip">New workspace</span>
            </div>

            <div className="grid gap-6 p-6 sm:p-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">First run</p>
                <h2 className="flowholt-display mt-4 text-[2.65rem] leading-none text-stone-950">
                  Enter with a clean workspace instead of raw builder noise.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600">
                  The direction is simple: better first-run clarity, cleaner workspace structure, and a path from idea to flow without exposing confusing system internals.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {starterPromises.map((item) => (
                  <div key={item} className="rounded-[1.35rem] border border-stone-900/10 bg-white/82 px-4 py-4 shadow-[var(--fh-shadow-soft)]">
                    <p className="text-sm font-medium text-stone-900">{item}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.7rem] border border-stone-900/10 bg-[#f7f3ed] p-5 shadow-[var(--fh-shadow-soft)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">After signup</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.3rem] border border-stone-900/8 bg-white px-4 py-4">
                    <p className="text-sm font-semibold text-stone-900">1. Create workspace</p>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Name the workspace and unlock the protected dashboard.</p>
                  </div>
                  <div className="rounded-[1.3rem] border border-stone-900/8 bg-white px-4 py-4">
                    <p className="text-sm font-semibold text-stone-900">2. Build from chat</p>
                    <p className="mt-2 text-sm leading-6 text-stone-600">Describe the annoying task and let FlowHolt draft the workflow.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
