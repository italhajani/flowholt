const authCards = [
  {
    title: "Sign in with Supabase",
    text: "Use Supabase email auth first. Social providers can wait until after the MVP is stable.",
  },
  {
    title: "Workspace access",
    text: "After login, send the user straight into the dashboard or an onboarding workspace flow.",
  },
  {
    title: "Free-tier friendly",
    text: "Keep auth simple: email and password now, magic links later only if needed.",
  },
];

export default function LoginPage() {
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
            This page is ready for Supabase auth wiring. Once your project URL and anon key are added, we will connect the real form and session handling here.
          </p>
        </section>

        <section className="rounded-[2rem] border border-stone-900/10 bg-white p-8 shadow-[0_12px_40px_rgba(39,35,31,0.06)]">
          <div className="space-y-4">
            {authCards.map((card) => (
              <div key={card.title} className="rounded-[1.5rem] border border-stone-900/10 bg-stone-50 p-5">
                <h2 className="text-lg font-semibold text-stone-950">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{card.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
