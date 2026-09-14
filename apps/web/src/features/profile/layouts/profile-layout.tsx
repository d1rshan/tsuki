import { ProfileHeaderShell } from "../components/profile-header";

export function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  return (
    <div className="min-h-screen pt-20 pb-12 md:pt-28 md:pb-16">
      <ProfileHeaderShell params={params} />
      {children}
    </div>
  );
}
