import type { ReactNode } from "react";
import "./styles.css";

export const metadata = {
  title: "OSKA Control Plane",
  description: "Durable orchestration and verification control plane for OSKA operations",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
