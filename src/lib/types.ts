export type User = {
  id: string;
  email: string;
  name: string;
};

export type ShareRole = "viewer" | "editor";

export type DocumentSummary = {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  ownerId: string;
  ownerName: string;
  access: "owner" | ShareRole;
};

export type DocumentDetail = DocumentSummary & {
  contentHtml: string;
  shares: Array<{
    userId: string;
    email: string;
    name: string;
    role: ShareRole;
  }>;
};
