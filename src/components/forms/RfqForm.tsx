import { useState, type FormEvent } from "react";
import { getProduct, modelName, type Product } from "@/data/catalog";
import { useShortlist, SiteLink } from "../Layout";
import { site } from "@/config/site";

export function RfqForm({ model, models }: { model?: string; models?: Product[] }) {
  const { ids, storageAvailable } = useShortlist();
  const selected =
    models ??
    [...new Set([...(model && getProduct(model) ? [model] : []), ...ids])]
      .map(getProduct)
      .filter((p) => !!p);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const value = (name: string) => String(fields.get(name) || "").trim();
    setDraft(
      `OSKA quotation enquiry\n\nName: ${value("name")}\nCompany: ${value("company")}\nEmail: ${value("email")}\nCountry: ${value("country")}\nQuantity: ${value("quantity")}\nPreferred material / size: ${value("material")}\nModels: ${selected.map(modelName).join("; ") || "General enquiry"}\n\n${value("message")}`,
    );
    setStatus("Draft prepared locally. Nothing has been sent. Review and copy the text below.");
  }
  return (
    <>
      <p>This private preview prepares an enquiry locally. Automatic delivery is not connected.</p>
      {!models && (
        <div className="rfq-selection">
          <h3>Selected models</h3>
          {selected.length ? (
            <ul>
              {selected.map((p) => (
                <li key={p.id}>{modelName(p)}</li>
              ))}
            </ul>
          ) : (
            <p>
              No models selected. You can prepare a general enquiry or{" "}
              <SiteLink href="/collections" className="text-link">
                explore collections
              </SiteLink>
              .
            </p>
          )}
          <SiteLink href="/shortlist" className="text-link">
            Manage shortlist
          </SiteLink>
          {!storageAvailable && (
            <p>Browser storage is unavailable. Your shortlist lasts for this visit only.</p>
          )}
        </div>
      )}
      <form
        className="rfq-form"
        onSubmit={prepare}
        onChange={() => {
          setDraft("");
          setStatus("");
        }}
      >
        <label>
          Your name
          <input name="name" required maxLength={120} autoComplete="name" />
        </label>
        <label>
          Company
          <input name="company" required maxLength={160} autoComplete="organization" />
        </label>
        <label>
          Email
          <input name="email" type="email" required maxLength={200} autoComplete="email" />
        </label>
        <label>
          Country
          <input name="country" maxLength={120} autoComplete="country-name" />
        </label>
        <label>
          Estimated quantity
          <input name="quantity" maxLength={120} placeholder="e.g. 50 pieces per model" />
        </label>
        <label>
          Material, finish or size preference
          <input name="material" maxLength={200} />
        </label>
        <label>
          Your enquiry
          <textarea name="message" required maxLength={4000} />
        </label>
        <button className="button" type="submit">
          Prepare enquiry draft
        </button>
      </form>
      <p role="status" className={status ? "status" : ""}>
        {status}
      </p>
      {draft && (
        <div>
          <h3>Review your enquiry</h3>
          <pre className="rfq-preview">{draft}</pre>
          <div className="actions">
            <button
              onClick={() => {
                const url = URL.createObjectURL(
                  new Blob([draft], { type: "text/plain;charset=utf-8" }),
                );
                const link = document.createElement("a");
                link.href = url;
                link.download = "OSKA-enquiry-draft.txt";
                link.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }}
            >
              Download draft
            </button>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(draft);
                  setStatus("Enquiry copied. Nothing has been sent.");
                } catch {
                  setStatus("Clipboard unavailable. Select and copy the draft text manually.");
                }
              }}
            >
              Copy enquiry
            </button>
            {site.contact.email && (
              <a
                className="button"
                href={`mailto:${site.contact.email}?subject=OSKA%20quotation%20enquiry&body=${encodeURIComponent(draft)}`}
              >
                Open email draft
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
