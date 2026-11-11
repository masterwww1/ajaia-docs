import type { DocumentDetail, DocumentSummary, ShareRole, User } from "./types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  me: () => request<{ user: User | null; users: User[] }>("/api/auth/me"),
  login: (email: string, password: string) =>
    request<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
  listDocuments: () =>
    request<{ owned: DocumentSummary[]; shared: DocumentSummary[] }>("/api/documents"),
  createDocument: (title?: string) =>
    request<{ document: DocumentDetail }>("/api/documents", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  getDocument: (id: string) =>
    request<{ document: DocumentDetail }>(`/api/documents/${id}`),
  updateDocument: (id: string, patch: { title?: string; contentHtml?: string }) =>
    request<{ document: DocumentDetail }>(`/api/documents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteDocument: (id: string) =>
    request<{ ok: boolean }>(`/api/documents/${id}`, { method: "DELETE" }),
  shareDocument: (id: string, email: string, role: ShareRole) =>
    request<{ document: DocumentDetail }>(`/api/documents/${id}/share`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),
  revokeShare: (id: string, userId: string) =>
    request<{ document: DocumentDetail }>(`/api/documents/${id}/share/${userId}`, {
      method: "DELETE",
    }),
  importFile: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ document: DocumentDetail }>("/api/documents/import", {
      method: "POST",
      body: form,
    });
  },
};
