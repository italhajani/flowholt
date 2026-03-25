import Link from "next/link";

import { login } from "@/app/auth/actions";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : {};
  const error = readMessage(params.error);
  const message = readMessage(params.message);

  return (
    <main className="min-h-screen bg-[#f4f1e8] px-6 py-12 text-stone-900">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] bg-stone-950 p-8 text-stone-100">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">
            FlowHolt
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">
            Sign in to your workflow workspace.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-stone-300">
            Email and password is the first MVP auth path. After sign in, users are redirected into the protected dashboard and studio routes.
          </p>
          <p className="mt-6 text-sm text-stone-400">
            Need an account? {" "}
            <Link href="/signup" className="text-stone-100 underline underline-offset-4">
              Create one
            </Link>
          </p>
        </section>

        <section className="rounded-[2rem] border border-stone-900/10 bg-white p-8 shadow-[0_12px_40px_rgba(39,35,31,0.06)]">
          <form action={login} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 outline-none ring-0 transition focus:border-stone-900/30"
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
                className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 outline-none ring-0 transition focus:border-stone-900/30"
              />
            </div>
            {message ? (
              <p className="rounded-2xl bg-[#eef4ef] px-4 py-3 text-sm text-emerald-900">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="rounded-2xl bg-[#f7ede2] px-4 py-3 text-sm text-amber-950">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
            >
              Sign in
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
