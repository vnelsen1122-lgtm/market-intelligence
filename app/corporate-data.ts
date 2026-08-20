export const messagingTaxonomy = [
  "AI and automation", "connected platform", "operational risk", "contractor safety", "sustainability and ESG", "compliance automation", "frontline and mobile", "analytics and intelligence", "workforce readiness", "supply-chain risk",
];

export const corporateSourceHierarchy = [
  { level: 1, label: "Primary filing or company release", examples: "SEC EDGAR, investor relations, official newsroom", use: "Transaction facts, dates, parties, consideration, management statements" },
  { level: 2, label: "Government or court record", examples: "FTC, DOJ, state registry, court docket", use: "Regulatory status, challenges, approvals, legal events" },
  { level: 3, label: "Approved trade reporting", examples: "EHS Today and named sector publications", use: "Discovery and sector context; facts traced back to primary sources" },
  { level: 4, label: "Analyst interpretation", examples: "Internal synthesis with named author and timestamp", use: "Implications only; never stored as transaction fact" },
];

export const monitoringJobs = [
  { name: "Competitor product surfaces", coverage: "16 mapped competitors", cadence: "Weekly", method: "Snapshot + semantic diff", status: "Mapped" },
  { name: "Official newsrooms", coverage: "Press releases and company announcements", cadence: "Daily", method: "RSS / sitemap / page monitor", status: "Mapped" },
  { name: "SEC EDGAR", coverage: "Public-company filings and exhibits", cadence: "Daily", method: "Official submissions and filing APIs", status: "Ready" },
  { name: "EHS Today watch", coverage: "Sector transactions and product news", cadence: "Daily", method: "Discovery monitor; primary-source confirmation required", status: "Mapped" },
];

export const changeContract = ["company_id", "page_url", "page_type", "captured_at", "content_hash", "previous_hash", "changed_terms", "messaging_tags", "source_excerpt", "review_status"];
