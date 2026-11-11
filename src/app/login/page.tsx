"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api-client";

const DEMO_USERS = [
  { email: "alice@ajaia.dev", name: "Alice Chen", note: "Owns seeded docs" },
  { email: "bob@ajaia.dev", name: "Bob Rivera", note: "Editor on shared doc" },
  { email: "carol@ajaia.dev", name: "Carol Okonkwo", note: "Viewer on shared doc" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("alice@ajaia.dev");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.login(email, password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:gap-16">
      <section className="max-w-md">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">Ajaia Docs</p>
        <h1 className="mt-3 font-[family-name:var(--font-doc)] text-4xl leading-tight text-ink sm:text-5xl">
          Shared writing, without the ceremony.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          Create documents, import plain text or Markdown, and share access with teammates.
          Seeded demo accounts keep the review flow simple.
        </p>
      </section>

      <section className="w-full max-w-md rounded-2xl border border-line bg-paper-strong p-6 shadow-[var(--shadow)]">
        <h2 className="text-lg font-semibold text-ink">Sign in</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Password for all demo users: <code className="rounded bg-paper px-1.5 py-0.5">password</code>
        </p>

        <div className="mt-4 grid gap-2">
          {DEMO_USERS.map((user) => (
            <button
              key={user.email}
              type="button"
              onClick={() => {
                setEmail(user.email);
                setPassword("password");
              }}
              className={`rounded-xl border px-3 py-2 text-left transition ${
                email === user.email
                  ? "border-accent bg-accent-soft"
                  : "border-line bg-paper hover:border-ink/20"
              }`}
            >
              <div className="text-sm font-medium text-ink">{user.name}</div>
              <div className="text-xs text-ink-soft">
                {user.email} · {user.note}
              </div>
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-ink-soft">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 outline-none ring-accent focus:ring-2"
              autoComplete="username"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink-soft">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 outline-none ring-accent focus:ring-2"
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-ink px-4 py-2.5 font-medium text-paper-strong hover:bg-ink/90 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Continue"}
          </button>
        </form>
      </section>
    </div>
  );
}
