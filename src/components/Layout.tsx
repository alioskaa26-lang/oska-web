import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, Heart, Menu, Search, X } from "lucide-react";
import {
  collections,
  collectionsOf,
  collectionPath,
  getProduct,
  type Gender,
} from "@/data/catalog";

const ShortlistContext = createContext<{
  ids: string[];
  toggle: (id: string) => void;
  storageAvailable: boolean;
}>({ ids: [], toggle: () => {}, storageAvailable: true });
export function useShortlist() {
  return useContext(ShortlistContext);
}
export function SiteLink({
  href,
  children,
  className = "",
  target = "_self",
  ...props
}: { href: string; children: ReactNode; className?: string } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
>) {
  return (
    <Link to={href} className={className} target={target} {...props}>
      {children}
    </Link>
  );
}
export function Layout({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem("oska-shortlist") || "[]");
      if (Array.isArray(saved))
        setIds(saved.filter((id): id is string => typeof id === "string" && !!getProduct(id)));
    } catch {
      setStorageAvailable(false);
    }
  }, []);
  const toggle = (id: string) => {
    if (!getProduct(id)) return;
    setIds((current) => {
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      try {
        localStorage.setItem("oska-shortlist", JSON.stringify(next));
      } catch {
        setStorageAvailable(false);
      }
      return next;
    });
  };
  return (
    <ShortlistContext.Provider value={{ ids, toggle, storageAvailable }}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <footer>
        <div>
          <SiteLink href="/" className="wordmark">
            OSKA
          </SiteLink>
          <p>
            Jewelry with character.
            <br />
            Istanbul, Türkiye
          </p>
        </div>
        <div>
          <p className="eyebrow">Explore</p>
          <SiteLink href="/women">Women</SiteLink>
          <SiteLink href="/men">Men</SiteLink>
          <SiteLink href="/collections">All collections</SiteLink>
        </div>
        <div>
          <p className="eyebrow">The atelier</p>
          <SiteLink href="/atelier">Craft &amp; process</SiteLink>
          <SiteLink href="/about">About OSKA</SiteLink>
          <SiteLink href="/contact">Contact</SiteLink>
          <SiteLink href="/faq">Questions &amp; answers</SiteLink>
        </div>
        <div>
          <p className="eyebrow">Private preview</p>
          <p>
            Local catalog presentation.
            <br />
            Model assignments and specifications
            <br />
            are subject to confirmation.
          </p>
          <SiteLink href="/rfq">Prepare an enquiry ↗</SiteLink>
        </div>
        <small>
          © {new Date().getFullYear()} OSKA Jewelry · Private preview · No orders or payments
        </small>
      </footer>
    </ShortlistContext.Provider>
  );
}
function Header() {
  const [menu, setMenu] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { pathname } = useLocation();
  const { ids } = useShortlist();
  useEffect(() => {
    setMenu(null);
    setMobile(false);
    setHidden(false);
  }, [pathname]);
  useEffect(() => {
    let previous = window.scrollY;
    const onScroll = () => {
      const next = Math.max(0, window.scrollY);
      if (Math.abs(next - previous) > 6) {
        setHidden(next > previous && next > 140);
        previous = next;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const close = () => {
    setMenu(null);
    setMobile(false);
  };
  const groups = [
    { id: "women", label: "Women" },
    { id: "men", label: "Men" },
    { id: "collections", label: "Collections" },
  ];
  return (
    <header
      className={`site-header ${hidden && !menu && !mobile ? "header-hidden" : ""}`}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          close();
          const button = e.currentTarget.querySelector<HTMLButtonElement>('[aria-expanded="true"]');
          button?.focus();
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) close();
      }}
    >
      <div className="announcement">
        OSKA JEWELRY · ISTANBUL ATELIER <span>PRIVATE PREVIEW</span>
      </div>
      <div className="header-main">
        <button
          className="icon mobile-toggle"
          onClick={() => setMobile(!mobile)}
          aria-label={mobile ? "Close navigation" : "Open navigation"}
          aria-expanded={mobile}
          aria-controls="primary-nav"
        >
          {mobile ? <X /> : <Menu />}
        </button>
        <SiteLink href="/" className="wordmark" aria-label="OSKA home">
          OSKA
        </SiteLink>
        <div className="utilities">
          <SiteLink href="/search" aria-label="Search models" className="icon">
            <Search size={19} />
          </SiteLink>
          <SiteLink
            href="/shortlist"
            aria-label={`Shortlist, ${ids.length} models`}
            className="icon"
          >
            <Heart size={19} />
            <span>{ids.length}</span>
          </SiteLink>
          <span className="language" title="English preview. Turkish interface pending review.">
            EN{" "}
            <button disabled aria-label="Turkish translation pending review">
              TR
            </button>
          </span>
          <SiteLink href="/rfq" className="header-rfq">
            Request a quote <ArrowUpRight size={14} />
          </SiteLink>
        </div>
      </div>
      <nav
        id="primary-nav"
        aria-label="Primary"
        className={mobile ? "nav-open" : ""}
        onMouseLeave={() => {
          if (!mobile) setMenu(null);
        }}
      >
        <div className="nav-items">
          {groups.map((group) => (
            <div
              className="nav-group"
              key={group.id}
              onMouseEnter={() => {
                if (window.matchMedia("(hover: hover)").matches) setMenu(group.id);
              }}
            >
              <SiteLink href={`/${group.id}`}>{group.label}</SiteLink>
              <button
                aria-label={`Explore ${group.label}`}
                aria-expanded={menu === group.id}
                aria-controls={`menu-${group.id}`}
                onClick={() => setMenu(menu === group.id ? null : group.id)}
              >
                <ChevronDown size={12} />
              </button>
            </div>
          ))}
          {["Atelier", "About", "Contact"].map((label) => (
            <SiteLink
              key={label}
              href={`/${label.toLowerCase()}`}
              onMouseEnter={() => setMenu(null)}
            >
              {label}
            </SiteLink>
          ))}
        </div>
        {groups.map(
          (group) =>
            menu === group.id && (
              <div id={`menu-${group.id}`} className="mega-menu" key={group.id}>
                <div>
                  <p className="eyebrow">The world of OSKA</p>
                  <h2>{group.label}</h2>
                  <SiteLink href={`/${group.id}`} onClick={close}>
                    Discover all {group.label.toLowerCase()} ↗
                  </SiteLink>
                </div>
                <div>
                  <p className="eyebrow">Main collections</p>
                  {(group.id === "collections"
                    ? collections
                    : collectionsOf(group.id as Gender)
                  ).map((c) => (
                    <SiteLink
                      key={c.id}
                      href={
                        group.id === "collections"
                          ? `/collections/${c.id}`
                          : collectionPath(group.id as Gender, c.id)
                      }
                      onClick={close}
                    >
                      {c.name.en}
                    </SiteLink>
                  ))}
                </div>
                <div>
                  <p className="eyebrow">A considered selection</p>
                  <p>
                    Sculptural forms.
                    <br />
                    Articulated links.
                    <br />
                    An unmistakable point of view.
                  </p>
                  <SiteLink href="/atelier" onClick={close}>
                    Inside the atelier ↗
                  </SiteLink>
                </div>
                <button
                  className="menu-close icon"
                  aria-label="Close collection menu"
                  onClick={() => setMenu(null)}
                >
                  <X size={18} />
                </button>
              </div>
            ),
        )}
      </nav>
    </header>
  );
}
