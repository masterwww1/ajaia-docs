import { redirect } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { readSessionUser } from "@/lib/auth";
import { listDocumentsForUser } from "@/lib/documents";

export const runtime = "nodejs";

export default async function HomePage() {
  const user = await readSessionUser();
  if (!user) redirect("/login");

  const { owned, shared } = listDocumentsForUser(user.id);
  return <Dashboard user={user} owned={owned} shared={shared} />;
}
