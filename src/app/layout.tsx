import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prooflane — Sicherheitsnachweise für Lieferketten",
  description:
    "Der aktuelle, kontrolliert freigebbare Sicherheitsnachweis für industrielle Lieferketten.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
