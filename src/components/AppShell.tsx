"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";
import { api } from "@/lib/api-client";

export function AppShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function logout() {
    await api.logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line/80 bg-paper-strong/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight text-ink">Ajaia</span>
            <span className="text-sm text-ink-soft">Docs</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <div className="hidden text-right sm:block">
              <div className="font-medium text-ink">{user.name}</div>
              <div className="text-ink-soft">{user.email}</div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-line bg-paper-strong px-3 py-1.5 text-ink-soft hover:border-ink/30 hover:text-ink"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
