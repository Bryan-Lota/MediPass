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
  | "Rejected";

export interface EvidenceRecord {
  id: string;
  name: string;
  type: string;
  /** Canonical content the hash is computed from — mutating this is what "tampering" means. */
  content: string;
  /**
   * "utf8" (default) for the seed/demo fixtures, where `content` is plain text.
   * "hex" for real uploaded documents, where `content` is the hex encoding of
   * the file's actual bytes — there's no off-chain storage in this PoC, so this
   * hex string is the stand-in for "the stored document".
   */
  contentEncoding?: "utf8" | "hex";
  /** Original filename, for real uploads. */
  fileName?: string;
  fileSize?: number;
  /** The hash originally anchored on-chain at submission time. Never changes. */
  anchoredHash: string;
  issuer: string;
  timestamp: string;
  txid: string;
  status: EvidenceStatus;
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
