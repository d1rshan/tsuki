import { renderProfileOgImage } from "@/features/profile/og-image";

export const alt = "Profile card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  return renderProfileOgImage((await params).username);
}
