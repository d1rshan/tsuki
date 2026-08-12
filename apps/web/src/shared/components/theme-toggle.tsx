"use client";

import { Palette } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { THEMES } from "@/shared/lib/themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:!bg-transparent hover:text-foreground"
            aria-label="Choose color theme"
          />
        }
      >
        <Palette />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Color theme</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={setTheme}
            className="grid grid-cols-2"
          >
            <DropdownMenuRadioItem value="system" className="col-span-2">
              System
            </DropdownMenuRadioItem>
            {THEMES.map(({ id, name, color }) => (
              <DropdownMenuRadioItem key={id} value={id}>
                <span
                  className="size-2.5 shrink-0 rounded-full ring-1 ring-foreground/15"
                  style={{ backgroundColor: color }}
                />
                {name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
