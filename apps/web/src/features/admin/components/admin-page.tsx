type AdminPageProps = {
  title: string;
  children: React.ReactNode;
};

export function AdminPage({ title, children }: AdminPageProps) {
  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-black tracking-tighter uppercase">{title}</h1>
      </header>
      {children}
    </section>
  );
}
