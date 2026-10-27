"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

import { SoftBlurEdge } from "@/shared/components/soft-blur-edge";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <>
      <SoftBlurEdge edge="bottom" />
      <Sonner
        theme={theme as ToasterProps["theme"]}
        position="bottom-center"
        className="toaster group"
        icons={{
          success: <CircleCheckIcon className="size-4" />,
          info: <InfoIcon className="size-4" />,
          warning: <TriangleAlertIcon className="size-4" />,
          error: <OctagonXIcon className="size-4" />,
          loading: <Loader2Icon className="size-4 animate-spin" />,
        }}
        style={
          {
            "--normal-bg": "var(--muted)",
            "--normal-text": "var(--foreground)",
            "--normal-border": "transparent",
            "--border-radius": "var(--radius)",
            "--width": "min(300px, calc(100vw - 2rem))",
          } as React.CSSProperties
        }
        toastOptions={{
          classNames: {
            toast: "cn-toast bg-muted text-foreground !rounded-full font-medium !shadow-none",
            title: "!font-medium",
            description: "text-muted-foreground !font-medium",
          },
        }}
        {...props}
      />
    </>
  );
};

export { Toaster };
