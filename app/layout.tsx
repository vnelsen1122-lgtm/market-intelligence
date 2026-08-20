import type { Metadata } from "next";
import "./styles.css";
import "./refined-shell.css";

export const metadata: Metadata = {
  title: "Market Intelligence",
  description: "Evidence-backed EHS market, compliance, and competitive intelligence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
