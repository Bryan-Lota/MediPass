import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/session";
import { EvidenceStoreProvider } from "@/lib/evidence-store";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DigiMedPass — Regulatory evidence you can prove",
  description:
    "A cryptographic evidence passport for cross-border medical device compliance. Confidential dossiers stay off-chain; only their cryptographic commitments are anchored to BSV.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`}>
      <body className="font-sans antialiased">
        <SessionProvider>
          <EvidenceStoreProvider>{children}</EvidenceStoreProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
