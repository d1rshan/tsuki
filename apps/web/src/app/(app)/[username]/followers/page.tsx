import { redirect } from "next/navigation";

/** Followers and following now live together on the Social tab. */
export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  redirect(`/${(await params).username}/social`);
}
