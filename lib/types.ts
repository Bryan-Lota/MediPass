export type Role = "manufacturer" | "regulator";

export type Market = "EU" | "US";

export type MarketStatus =
  | "Evidence Complete"
  | "Pending Review"
  | "Incomplete"
  | "Revoked";

export type EvidenceStatus =
  | "Verified"
  | "Pending Review"
  | "Tampered"
  | "Revoked"
  | "Rejected"
  | "Info Requested";

export interface EvidenceRecord {
  id: string;
  name: string;
  type: string;
  /** Which destination market(s) this evidence applies to — drives the EU/FDA tabs. */
  markets: Market[];
  /** Canonical content the hash is computed from — mutating this is what "tampering" means. */
  content: string;
  /**
   * "utf8" (default) for the seed/demo fixtures, where `content` is plain text.
   * "encrypted" for real uploaded documents — `content` is AES-256-GCM
   * ciphertext (see lib/vault.ts), the password-protected off-chain storage
   * layer; "hex" (legacy) is the file's raw bytes hex-encoded, unencrypted.
   */
  contentEncoding?: "utf8" | "hex" | "encrypted";
  /** Original filename, for real uploads. */
  fileName?: string;
  fileSize?: number;
  /** The hash originally anchored on-chain at submission time. Never changes. */
  anchoredHash: string;
  issuer: string;
  timestamp: string;
  txid: string;
  status: EvidenceStatus;
  /**
   * Kept off-chain, never anchored — the regulator's reason for a rejection, or
   * a note requesting more documentation. Free-text confidential business
   * content has no business on a public chain.
   */
  regulatorNote?: string;
}

export interface ChecklistItem {
  label: string;
  met: boolean;
  detail: string;
}

export interface TimelineEvent {
  label: string;
  timestamp: string;
  /** Set when this event was genuinely broadcast to BSV — a real 64-hex txid, not seed/demo data. */
  txid?: string;
}

export interface DevicePassport {
  id: string;
  device: string;
  batch: string;
  manufacturer: string;
  euStatus: MarketStatus;
  usStatus: MarketStatus;
  euChecklist: ChecklistItem[];
  usChecklist: ChecklistItem[];
  rows: EvidenceRecord[];
  timeline: TimelineEvent[];
}

export interface Session {
  email: string;
  role: Role;
  ts: number;
}
