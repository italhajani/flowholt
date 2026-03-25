const signupSteps = [
  "Create account",
  "Create first workspace",
  "Choose a starter workflow path",
  "Open orchestrator",
];

export default function SignupPage() {
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
          This signup page is the placeholder for the Supabase registration flow. After auth is connected, this should become the first-run onboarding path for new users.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {signupSteps.map((step, index) => (
            <div key={step} className="rounded-[1.5rem] bg-[#eef4ef] p-5">
              <p className="text-sm font-semibold text-stone-500">Step {index + 1}</p>
              <p className="mt-3 text-lg font-semibold text-stone-950">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
