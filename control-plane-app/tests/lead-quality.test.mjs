import { describe, it, expect } from "vitest";
import { actualApex, assessPublicLead, sameFirm } from "../lib/lead-quality.mjs";

const good = {
  company:"Anadolu Mücevherat Ltd. Şti.",
  legalName:"Anadolu Mücevherat Limited",
  domain:"https://anadolumuecevherat.example",
  brand:"Label Jewellery",
  country:"Türkiye",
  itemUrl:"https://anadolumuecevherat.example/urun/14k",
  evidenceUrls:["https://anadolumuecevherat.example/urun/14k"],
  verifiedMetal:"solid_gold_14k",
  currentItem:true,
  independentSeller:true,
  b2bEconomicEvidence:true,
};
describe("fail-closed OSKA lead gate",()=>{
  it("accepts only independent actual merchant apex",()=>{
    expect(actualApex("https://www.trendyol.com/store/123")).toBeNull();
    expect(actualApex("http://example.com")).toBeNull();
    expect(actualApex("https://user:pass@example.com")).toBeNull();
    expect(actualApex("https://www.anadolumuecevherat.example")).toBe("anadolumuecevherat.example");
  });
  it("never certifies a researched lead without the independent verifier",()=>{
    expect(assessPublicLead(good).status).toBe("VERIFIER_PENDING");
  });
  it("treats stockist sharing a label as DISTINCT if legal companies differ",()=>{
    expect(sameFirm(good,{company:"Başka Altın Ltd.",domain:"baskaaltin.example",country:"Türkiye",brand:"Label Jewellery"})).toBe(false);
  });
  it("rejects exact merchant domain duplicate across brand routes",()=>{
    expect(assessPublicLead(good,[{company:"Different Shop Caption",country:"Türkiye",domain:"anadolumuecevherat.example"}]).status).toBe("DUPLICATE_REJECT");
  });
  it("detects the Takılingo marketplace to own-site duplicate by firm identity",()=>{
    const old={company:"Takılingo",country:"Türkiye",domain:"trendyol.com"};
    const newer={company:"Takılingo",country:"Türkiye",domain:"https://takilingo.com"};
    expect(sameFirm(old,newer)).toBe(true);
  });
  it("does not count listing/cart as outside buying evidence",()=>{
    expect(assessPublicLead({...good,b2bEconomicEvidence:false}).status).toBe("QUALIFICATION_REVIEW");
  });
  it("rejects maker-only with no outside sourcing demand",()=>{
    expect(assessPublicLead({...good,makerOnly:true,b2bEconomicEvidence:false}).status).toBe("LOW_PRIORITY");
  });
  it("does not convert steel-colored or gold-plated products into solid gold",()=>{
    expect(assessPublicLead({...good,verifiedMetal:"silver_colored_steel"}).status).toBe("SOURCE_SEED");
  });
  it("does not accept another company's item as a product",()=>{
    expect(assessPublicLead({...good,itemUrl:"https://brand.example/14k",evidenceUrls:["https://brand.example/14k"]}).status).toBe("SOURCE_SEED");
  });
  it("never counts excluded firms",()=>{
    expect(assessPublicLead({...good,company:"Else Silver"}).status).toBe("REJECT");
  });
});
