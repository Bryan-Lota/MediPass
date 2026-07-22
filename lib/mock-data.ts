import type { DevicePassport } from "./types";

/**
 * Demo fixtures. Each evidence record's `anchoredHash` is the real SHA-256
 * of `content` at submission time (verify with `sha256Hex(content)`).
 * "Simulate tampering" mutates `content` in place, which is what makes the
 * on-page recompute-and-compare genuinely fail rather than just flip a flag.
 */
export const passports: Record<string, DevicePassport> = {
  x1: {
    id: "x1",
    device: "CardioFlow X1",
    batch: "04A",
    manufacturer: "Acme MedTech Ltd.",
    euStatus: "Evidence Complete",
    usStatus: "Incomplete",
    euChecklist: [
      { label: "QMS Certificate (ISO 13485)", met: true, detail: "exp 2027-03-01" },
      { label: "Test Report", met: true, detail: "exp 2026-11-15" },
      { label: "Declaration of Conformity", met: true, detail: "exp 2027-06-30" },
    ],
    usChecklist: [
      { label: "QMS Certificate (ISO 13485)", met: true, detail: "exp 2027-03-01" },
      { label: "Sterilisation Validation", met: false, detail: "missing" },
      { label: "510(k) Declaration", met: false, detail: "missing" },
    ],
    rows: [
      {
        id: "qms",
        name: "QMS Certificate",
        type: "QMS",
        markets: ["EU", "US"],
        content:
          "QMS_CERTIFICATE|CardioFlow X1|Acme MedTech Ltd.|ISO 13485|issued 2026-05-02|expires 2027-03-01",
        anchoredHash: "2e032505a1c7cdf6ffa61b34fabf8d9c33e56fca6a9f7108b5344b6ed5ab76af",
        issuer: "Acme MedTech",
        timestamp: "2026-05-02 09:14",
        txid: "7fa1…c02d",
        status: "Verified",
      },
      {
        id: "test",
        name: "Test Report",
        type: "Test",
        markets: ["EU", "US"],
        content:
          "TEST_REPORT|CardioFlow X1|Acme MedTech Ltd.|bench + biocompatibility|issued 2026-05-04|expires 2026-11-15",
        anchoredHash: "5bf3fbafa5e8ecdc41f75e22d88fd4ebe508d373e8d2352137546024216dd1f7",
        issuer: "Acme MedTech",
        timestamp: "2026-05-04 11:02",
        txid: "2b98…e711",
        status: "Verified",
      },
      {
        id: "doc",
        name: "Declaration of Conformity",
        type: "DoC",
        markets: ["EU"],
        content:
          "DECLARATION_CONFORMITY|CardioFlow X1|Acme MedTech Ltd.|EU MDR 2017/745|issued 2026-05-06|expires 2027-06-30",
        anchoredHash: "77c6f5c94a46ebf1a8247e4301cb903265ba96055f3871183a6e4ad26eca35bd",
        issuer: "Acme MedTech",
        timestamp: "2026-05-06 15:40",
        txid: "a041…9bd2",
        status: "Verified",
      },
      {
        id: "udi",
        name: "UDI Device Record",
        type: "UDI",
        markets: ["EU", "US"],
        content:
          "UDI_RECORD|CardioFlow X1|Acme MedTech Ltd.|UDI-DI 00889812345670|issued 2026-05-08",
        anchoredHash: "dd0bddfb1e90f192aee57e2055da80abe012ddeeba08842efdb3c37e0152f31a",
        issuer: "Acme MedTech",
        timestamp: "2026-05-08 08:20",
        txid: "c7e3…10af",
        status: "Pending Review",
      },
    ],
    timeline: [
      { label: "Evidence submitted", timestamp: "2026-05-02 09:14" },
      { label: "Reviewed by verifier", timestamp: "2026-05-05 10:03" },
      { label: "EU market: Evidence Complete", timestamp: "2026-05-06 15:41" },
    ],
  },
  n2: {
    id: "n2",
    device: "NeuroSense N2",
    batch: "11C",
    manufacturer: "Meridian Devices Inc.",
    euStatus: "Pending Review",
    usStatus: "Evidence Complete",
    euChecklist: [
      { label: "QMS Certificate (ISO 13485)", met: true, detail: "exp 2027-09-01" },
      { label: "Clinical Evaluation Report", met: false, detail: "in review" },
    ],
    usChecklist: [
      { label: "QMS Certificate (ISO 13485)", met: true, detail: "exp 2027-09-01" },
      { label: "UDI Device Record", met: true, detail: "assigned" },
    ],
    rows: [
      {
        id: "qms2",
        name: "QMS Certificate",
        type: "QMS",
        markets: ["EU", "US"],
        content:
          "QMS_CERTIFICATE|NeuroSense N2|Meridian Devices Inc.|ISO 13485|issued 2026-04-18|expires 2027-09-01",
        anchoredHash: "eae504bdac87ded6705278324f27f7cf205b212cbcfa5f229536b62168b8311b",
        issuer: "Meridian Devices",
        timestamp: "2026-04-18 13:22",
        txid: "9e0c…a341",
        status: "Verified",
      },
      {
        id: "udi2",
        name: "UDI Device Record",
        type: "UDI",
        markets: ["EU", "US"],
        content:
          "UDI_RECORD|NeuroSense N2|Meridian Devices Inc.|UDI-DI 00889812349981|issued 2026-04-20",
        anchoredHash: "3d321ce37d5bfa77d396e46895fe63f0aeb5ff453e8f998ea151eb8e055f5989",
        issuer: "Meridian Devices",
        timestamp: "2026-04-20 10:10",
        txid: "5a11…8d0c",
        status: "Pending Review",
      },
    ],
    timeline: [
      { label: "Evidence submitted", timestamp: "2026-04-18 13:22" },
      { label: "US market: Evidence Complete", timestamp: "2026-04-22 09:00" },
    ],
  },
  o3: {
    id: "o3",
    device: "OrthoGrip O3",
    batch: "02B",
    manufacturer: "Helvetia Ortho AG",
    euStatus: "Revoked",
    usStatus: "Incomplete",
    euChecklist: [
      { label: "Declaration of Conformity", met: false, detail: "revoked" },
    ],
    usChecklist: [{ label: "FDA Establishment Listing", met: false, detail: "missing" }],
    rows: [
      {
        id: "doc3",
        name: "Declaration of Conformity",
        type: "DoC",
        markets: ["EU"],
        content:
          "DECLARATION_CONFORMITY|OrthoGrip O3|Helvetia Ortho AG|EU MDR 2017/745|issued 2026-03-11|expires 2028-01-01",
        anchoredHash: "5e76a23f8f53655ee08aeb5ba75888ac8c90f377db53e4f0718cb806703f3dde",
        issuer: "Helvetia Ortho",
        timestamp: "2026-03-11 08:40",
        txid: "c210…44fe",
        status: "Revoked",
      },
    ],
    timeline: [
      { label: "Evidence submitted", timestamp: "2026-03-11 08:40" },
      { label: "Declaration of Conformity revoked", timestamp: "2026-03-20 16:05" },
    ],
  },
};
