"use client";

import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

export function ProfileOgPreview() {
  const [username, setUsername] = useState("");
  const [selected, setSelected] = useState("");
  const [failed, setFailed] = useState(false);

  return (
    <section className="space-y-4" aria-labelledby="profile-og-heading">
      <h3 id="profile-og-heading" className="text-sm font-medium text-muted-foreground">
        Profile
      </h3>
      <form
        className="max-w-xl space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          setFailed(false);
          setSelected(username.trim());
        }}
      >
        <label htmlFor="og-profile-username" className="text-sm font-medium">
          Username
        </label>
        <div className="flex gap-2">
          <Input
            id="og-profile-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="e.g. d1rshan"
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_.]+"
            required
          />
          <Button type="submit">Preview</Button>
        </div>
      </form>
      {selected ? (
        <figure className="space-y-2">
          <figcaption className="text-sm text-muted-foreground">/{selected}</figcaption>
          {failed ? (
            <p role="alert" className="text-sm text-destructive">
              Could not load this preview. Check the username and try again.
            </p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/ui/og-preview/profile?username=${encodeURIComponent(selected)}`}
              onError={() => setFailed(true)}
              alt={`Open Graph preview for ${selected}`}
              width={1200}
              height={630}
              className="h-auto w-full rounded-lg border"
            />
          )}
        </figure>
      ) : (
        <p className="text-sm text-muted-foreground">
          Enter a username to preview its Open Graph image.
        </p>
      )}
    </section>
  );
}
