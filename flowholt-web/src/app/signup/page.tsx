import Link from "next/link";

import { signup } from "@/app/auth/actions";

type SignupPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = searchParams ? await searchParams : {};
  const error = readMessage(params.error);

  return (
    <main className="min-h-screen bg-[#f4f1e8] px-6 py-12 text-stone-900">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-stone-900/10 bg-white p-8 shadow-[0_12px_40px_rgba(39,35,31,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
          New Workspace
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Start building with FlowHolt.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Create an account first, then we will route new users into workspace setup and their first orchestrator prompt.
        </p>

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
              minLength={8}
              className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 outline-none ring-0 transition focus:border-stone-900/30"
            />
          </div>
          {error ? (
            <p className="rounded-2xl bg-[#f7ede2] px-4 py-3 text-sm text-amber-950">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
          >
            Create account
          </button>
          <p className="text-sm text-stone-500">
            Already have an account? {" "}
            <Link href="/login" className="text-stone-900 underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
