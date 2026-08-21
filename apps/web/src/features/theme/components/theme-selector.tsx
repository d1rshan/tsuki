"use client";

import { Palette } from "lucide-react";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { getThemeId, THEMES } from "@/features/theme/themes";

export function ThemeSelector() {
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
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={setTheme}
            className="grid grid-cols-2"
          >
            {THEMES.map((theme) => (
              <DropdownMenuRadioItem key={getThemeId(theme)} value={getThemeId(theme)}>
                <span
                  className="size-2.5 shrink-0 rounded-full ring-1 ring-foreground/15"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                {theme.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
