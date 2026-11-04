import { renderSiteOgImage } from "@/shared/lib/site-og-image";
import { siteTagline } from "@/shared/lib/site";

export const alt = siteTagline;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderSiteOgImage();
}
