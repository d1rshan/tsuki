import { ProfileFilterTabs, type ProfileFilterOption } from "./profile-filter-tabs";

/**
 * A profile route's filter as a sidebar: vertical on desktop, a scrollable row
 * on mobile, with the route's content in the remaining column.
 */
export function ProfileFilterLayout({
  children,
  label,
  options,
  selected,
}: {
  children: React.ReactNode;
  label: string;
  options: ProfileFilterOption[];
  selected: string;
}) {
  return (
    <div className="flex flex-col gap-6 pb-16 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start lg:gap-10">
      <ProfileFilterTabs
        className="lg:hidden"
        label={label}
        options={options}
        selected={selected}
      />
      <ProfileFilterTabs
        className="hidden lg:sticky lg:top-24 lg:block"
        label={label}
        options={options}
        orientation="vertical"
        selected={selected}
      />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
