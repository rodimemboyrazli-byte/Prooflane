import "server-only";

export const roles = ["owner", "editor", "viewer"] as const;
export type Role = (typeof roles)[number];

export const taskStatuses = ["open", "in_progress", "complete"] as const;
export type TaskStatus = (typeof taskStatuses)[number];

export const evidenceStatuses = ["draft", "needs_review", "approved", "expired"] as const;
export type EvidenceStatus = (typeof evidenceStatuses)[number];

export const shareStates = ["private", "shared"] as const;
export type ShareState = (typeof shareStates)[number];

export type SessionIdentity = {
  userId: string;
  organizationId: string;
  role: Role;
  email: string;
  name: string;
  organizationName: string;
};
