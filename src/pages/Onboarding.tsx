import AppHeader from "@/components/AppHeader";

const Onboarding = () => {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg-base">
      <AppHeader />
      <main className="flex flex-1 flex-col px-6 pt-6 pb-10">
        <p className="section-label mb-3">Onboarding</p>
        <h1 className="text-h1 text-text-primary">Erzähl uns von dir.</h1>
        <p className="mt-3 text-body text-text-secondary">
          Der mehrstufige Onboarding-Flow (Schule, Niveau, Fächer) wird in Phase 2 gebaut.
        </p>
      </main>
    </div>
  );
};

export default Onboarding;
