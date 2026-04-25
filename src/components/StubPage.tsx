import PageHeader from "@/components/PageHeader";

type StubPageProps = {
  title: string;
  eyebrow?: string;
  brand?: boolean;
  description?: string;
};

const StubPage = ({ title, eyebrow, brand, description }: StubPageProps) => {
  return (
    <section className="flex min-h-[calc(100dvh-6rem)] flex-col">
      <PageHeader title={title} eyebrow={eyebrow} brand={brand} />
      <div className="flex flex-1 items-center justify-center px-6 pb-10">
        <div className="rounded-large border border-white/[0.06] bg-surface px-6 py-8 text-center">
          <p className="section-label mb-2">Bald verfügbar</p>
          <p className="text-body text-text-secondary">
            {description ?? "Diese Ansicht wird in einer kommenden Phase gebaut."}
          </p>
        </div>
      </div>
    </section>
  );
};

export default StubPage;
