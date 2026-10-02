import type { ReactNode } from "react";
import "./styles.css";

export const metadata = {
  title: "JARVES — OSKA CORE",
  description: "JARVES voice interface for OSKA CORE",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
