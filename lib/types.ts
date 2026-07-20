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
  | "Revoked";

export interface EvidenceRecord {
  id: string;
  name: string;
  type: string;
  /** Canonical content the hash is computed from — mutating this is what "tampering" means. */
  content: string;
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
