"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit2, Plus, Trash2, Loader2 } from "lucide-react";
import type { UserOverview } from "@/lib/types";
import { api } from "@/lib/api";

import { useParams } from "next/navigation";
import { updateProfile } from "./actions";

type Profile = UserOverview["profile"];

export function EditProfileDialog({ profile }: { profile: Profile }) {
  const params = useParams();
  const username = params.username as string;
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    bio: profile?.bio || "",
    bannerImage: profile?.bannerImage || "",
    accentColor: profile?.accentColor || "#1f1f1f",
    socialLinks: Object.entries(profile?.socialLinks ?? {}),
  });

  const update =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const setSocialLinks = (fn: (links: [string, string][]) => [string, string][]) =>
    setForm((f) => ({ ...f, socialLinks: fn(f.socialLinks) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const socialLinks = Object.fromEntries(form.socialLinks.filter(([, url]) => url));

    try {
      const res = await updateProfile(
        {
          bio: form.bio || null,
          bannerImage: form.bannerImage || null,
          accentColor: form.accentColor || null,
          socialLinks: Object.keys(socialLinks).length ? socialLinks : null,
        },
        username,
      );

      if (!res.success) {
        console.error(res.error);
        alert(res.error); // Basic error handling, a toast would be better in a full app
        return;
      }

      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2 rounded-full">
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={form.bio}
              onChange={update("bio")}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bannerImage">Banner Image URL</Label>
            <Input
              id="bannerImage"
              type="url"
              placeholder="https://example.com/banner.jpg"
              value={form.bannerImage}
              onChange={update("bannerImage")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accentColor">Accent Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="accentColor"
                type="color"
                value={form.accentColor}
                onChange={update("accentColor")}
                className="w-12 h-12 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={form.accentColor}
                onChange={update("accentColor")}
                placeholder="#000000"
                className="font-mono uppercase flex-1"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Social Links</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSocialLinks((l) => [...l, ["", ""]])}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Link
              </Button>
            </div>
            {form.socialLinks.map(([platform, url], index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Platform"
                  value={platform}
                  onChange={(e) =>
                    setSocialLinks((l) =>
                      l.map((link, i) => (i === index ? [e.target.value, link[1]] : link)),
                    )
                  }
                  className="w-1/3"
                />
                <Input
                  placeholder="URL (e.g. https://x.com/...)"
                  type="url"
                  value={url}
                  onChange={(e) =>
                    setSocialLinks((l) =>
                      l.map((link, i) => (i === index ? [link[0], e.target.value] : link)),
                    )
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => setSocialLinks((l) => l.filter((_, i) => i !== index))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
