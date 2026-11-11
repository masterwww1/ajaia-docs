import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4">
      <h1 className="font-[family-name:var(--font-doc)] text-3xl text-ink">Document not found</h1>
      <p className="mt-2 text-ink-soft">
        It may have been deleted, or you do not have access with the current account.
      </p>
      <Link href="/" className="mt-6 text-accent hover:underline">
        Back to documents
      </Link>
    </div>
  );
}
