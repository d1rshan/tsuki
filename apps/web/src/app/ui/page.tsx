import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LoaderCircle, Plus } from "lucide-react";

import { AuthVerificationPreview } from "@/features/auth/components/auth-verification-preview";
import { ThemeSelector } from "@/shared/components/theme-selector";
import { Button } from "@/shared/components/ui/button";

export const metadata: Metadata = {
  title: "UI preview",
  robots: { index: false, follow: false },
};

const variants = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const;
const sizes = ["xs", "sm", "default", "lg"] as const;
const iconSizes = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const;

// Temporary design preview. Remove this route after the shared UI review.
export default function UiPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-4 py-10 pb-24 sm:px-8">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-4">
          <Button variant="link" size="sm" render={<Link href="/" />} nativeButton={false}>
            <ArrowLeft data-icon="inline-start" />
            Home
          </Button>
          <div className="space-y-2">
            <h1 className="text-3xl font-medium tracking-tight text-foreground">UI preview</h1>
            <p className="text-sm text-muted-foreground">
              Temporary preview of the shared button styles. Hover or use Tab to compare states.
            </p>
          </div>
        </div>
        <ThemeSelector />
      </header>

      <section aria-labelledby="auth-heading" className="space-y-4">
        <h2 id="auth-heading" className="text-lg font-medium text-foreground">
          Email verification
        </h2>
        <AuthVerificationPreview />
      </section>

      <section aria-labelledby="variants-heading" className="space-y-4">
        <h2 id="variants-heading" className="text-lg font-medium text-foreground">
          Variants & states
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-x-3 border-spacing-y-4 text-left">
            <thead className="text-xs font-medium text-muted-foreground">
              <tr>
                {[
                  "Variant",
                  "Default",
                  "Leading icon",
                  "Trailing icon",
                  "Disabled",
                  "Loading",
                  "Expanded",
                ].map((label) => (
                  <th key={label} scope="col" className="pb-2 font-medium whitespace-nowrap">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant}>
                  <th scope="row" className="pr-2 text-sm font-medium text-muted-foreground">
                    {variant}
                  </th>
                  <td>
                    <Button variant={variant}>Button</Button>
                  </td>
                  <td>
                    <Button variant={variant}>
                      <Plus data-icon="inline-start" />
                      Add to list
                    </Button>
                  </td>
                  <td>
                    <Button variant={variant}>
                      Continue
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                  </td>
                  <td>
                    <Button variant={variant} disabled>
                      Button
                    </Button>
                  </td>
                  <td>
                    <Button variant={variant} disabled aria-busy="true">
                      <LoaderCircle data-icon="inline-start" className="animate-spin" />
                      Saving
                    </Button>
                  </td>
                  <td>
                    <Button variant={variant} aria-expanded="true">
                      Button
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="sizes-heading" className="space-y-4">
        <h2 id="sizes-heading" className="text-lg font-medium text-foreground">
          Sizes
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {variants.map((variant) => (
            <div key={variant} className="space-y-5">
              <h3 className="text-sm font-medium text-muted-foreground">{variant}</h3>
              <div className="flex flex-wrap items-end gap-3">
                {sizes.map((size) => (
                  <div key={size} className="flex flex-col items-center gap-2">
                    <Button variant={variant} size={size}>
                      Button
                    </Button>
                    <span className="text-xs text-muted-foreground">{size}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-end gap-3">
                {iconSizes.map((size) => (
                  <div key={size} className="flex flex-col items-center gap-2">
                    <Button variant={variant} size={size} aria-label={`Add, ${variant}, ${size}`}>
                      <Plus />
                    </Button>
                    <span className="text-xs text-muted-foreground">{size}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="background-heading" className="space-y-4">
        <h2 id="background-heading" className="text-lg font-medium text-foreground">
          On the page background
        </h2>
        <div className="flex flex-wrap gap-3">
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
      </section>
    </main>
  );
}
