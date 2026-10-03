import { SiteLink } from "../Layout";
import type { AnchorHTMLAttributes } from "react";
export function LangLink({
  to,
  children,
  className = "",
  ...props
}: { to: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <SiteLink href={to} className={className} {...props}>
      {children}
    </SiteLink>
  );
}
