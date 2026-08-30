const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tsuki.fun";

/** Canonical production origin; metadataBase, canonicals, sitemap and OG URLs all hang off it. */
export const siteUrl = SITE_URL.replace(/\/$/, "");

export const siteName = "Tsuki";

export const siteTagline = `${siteName} — Track anime & manga`;

export const siteDescription = "Track, rate, and review anime and manga.";

export const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION || null;
