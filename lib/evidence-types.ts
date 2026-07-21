/**
 * The evidence taxonomy documented in the README's "Evidence types" table.
 * `checklistLabel`, when present, matches a label used in a passport's
 * euChecklist/usChecklist fixtures — a real upload of that type auto-marks
 * the corresponding checklist item as met.
 */
export interface EvidenceTypeDef {
  code: string;
  label: string;
  markets: ("EU" | "US")[];
  checklistLabel?: string;
}

export const EVIDENCE_TYPES: EvidenceTypeDef[] = [
  { code: "QMS_CERTIFICATE", label: "QMS Certificate", markets: ["EU", "US"], checklistLabel: "QMS Certificate (ISO 13485)" },
  { code: "TECH_FILE", label: "Technical Documentation", markets: ["EU", "US"] },
  { code: "TEST_REPORT", label: "Test Report", markets: ["EU", "US"], checklistLabel: "Test Report" },
  { code: "STERILISATION_REPORT", label: "Sterilisation Validation", markets: ["EU", "US"], checklistLabel: "Sterilisation Validation" },
  { code: "CLINICAL_EVALUATION", label: "Clinical Evaluation Report", markets: ["EU"], checklistLabel: "Clinical Evaluation Report" },
  { code: "DECLARATION_CONFORMITY", label: "Declaration of Conformity", markets: ["EU"], checklistLabel: "Declaration of Conformity" },
  { code: "UDI_RECORD", label: "UDI Device Record", markets: ["EU", "US"], checklistLabel: "UDI Device Record" },
  { code: "EU_REP_MANDATE", label: "Authorised Representative Mandate", markets: ["EU"] },
  { code: "FDA_LISTING", label: "FDA Establishment Listing", markets: ["US"], checklistLabel: "FDA Establishment Listing" },
  { code: "PREMARKET_SUBMISSION", label: "510(k) Declaration", markets: ["US"], checklistLabel: "510(k) Declaration" },
];

export function evidenceTypeByCode(code: string): EvidenceTypeDef | undefined {
  return EVIDENCE_TYPES.find((t) => t.code === code);
}
