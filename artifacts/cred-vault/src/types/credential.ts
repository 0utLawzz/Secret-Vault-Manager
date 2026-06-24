export const CredentialStatus = {
  New: "New",
  VPending: "VPending",
  USED: "USED",
} as const;

export type CredentialStatus = (typeof CredentialStatus)[keyof typeof CredentialStatus];

export interface Credential {
  id: number;
  email: string;
  password: string;
  credit: number | null;
  status: CredentialStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}
