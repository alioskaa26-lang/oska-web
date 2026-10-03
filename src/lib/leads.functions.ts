// The private preview intentionally has no network lead delivery path.
// Drafts are prepared in memory by EnquiryPages and downloaded at the user's request.
export type LeadResult = { status: "draft"; sent: false };
