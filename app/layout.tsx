import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Fredoka } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/session";
import { EvidenceStoreProvider } from "@/lib/evidence-store";
import { ToastProvider } from "@/lib/toast";
import { NotificationProvider } from "@/lib/notifications";

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

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MedPass — Regulatory evidence you can prove",
  description:
    "A cryptographic evidence passport for cross-border medical device compliance. Confidential dossiers stay off-chain; only their cryptographic commitments are anchored to BSV.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable} ${fredoka.variable}`}>
      <body className="font-sans antialiased">
        <SessionProvider>
          <EvidenceStoreProvider>
            <NotificationProvider>
              <ToastProvider>{children}</ToastProvider>
            </NotificationProvider>
          </EvidenceStoreProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
