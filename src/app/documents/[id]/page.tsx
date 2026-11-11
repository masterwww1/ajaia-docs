import { redirect, notFound } from "next/navigation";
import { DocumentWorkspace } from "@/components/DocumentWorkspace";
import { listUsers, readSessionUser } from "@/lib/auth";
import { getDocumentForUser } from "@/lib/documents";

export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };

export default async function DocumentPage({ params }: Props) {
  const user = await readSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const document = getDocumentForUser(id, user.id);
  if (!document) notFound();

  return (
    <DocumentWorkspace
      user={user}
      initialDocument={document}
      users={listUsers()}
    />
  );
}
