import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

type AuthStatusCardProps = {
  actions: React.ReactNode;
  description: readonly [string, string?];
  icon: LucideIcon;
  title: string;
};

export function AuthStatusCard({ actions, description, icon, title }: AuthStatusCardProps) {
  const Icon = icon;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Icon className="size-5 text-primary" aria-hidden="true" />
          {title}
        </CardTitle>
        <CardDescription className="space-y-2">
          {description.map(
            (text) =>
              text && (
                <span className="block" key={text}>
                  {text}
                </span>
              ),
          )}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex-col items-stretch gap-2">{actions}</CardFooter>
    </Card>
  );
}
