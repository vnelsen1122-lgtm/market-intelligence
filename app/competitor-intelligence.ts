export type EvidenceTier = "Primary" | "Vendor proof" | "Review signal" | "Internal";

export type IntelligenceSource = {
  label: string;
  url: string;
  tier: EvidenceTier;
  purpose: string;
  observedAt: string;
  caveat: string;
};

export type CompetitorIntelligence = {
  competitorId: string;
  researchStatus: "Research pass complete" | "Source map only";
  domains: string[];
  industries: string[];
  headquarters?: string;
  founded?: string;
  marketTier: string;
  buyingMotion: string;
  whyTheyWin: Array<{ claim: string; basis: string; sourceUrl: string }>;
  pressurePoints: Array<{ signal: string; boundary: string }>;
  ai: {
    label: string;
    summary: string;
    capabilities: string[];
    sourceUrl: string;
  };
  customerProof: Array<{ customer: string; industry: string; outcome: string; sourceUrl: string; caveat: string }>;
  reviewSignals: Array<{ platform: string; score: string; sample: string; themes: string[]; sourceUrl: string; caveat: string }>;
  activity: Array<{ date: string; type: string; title: string; summary: string; sourceUrl: string }>;
  questionsToTest: string[];
  sources: IntelligenceSource[];
};

export const competitorDomains = [
  "All capabilities",
  "Core EHS",
  "Safety & Training",
  "Sustainability",
  "Contractor Management",
  "Chemical & SDS",
  "Operational Risk",
  "Construction Safety",
  "AI",
];

export const sourcePolicies = [
  { source: "Official product and solution pages", decision: "Approved", use: "Current positioning, modules, industries, named features", boundary: "Company statement; does not prove adoption or performance." },
  { source: "Help centers and release notes", decision: "Approved", use: "Workflow depth, configuration detail, product changes", boundary: "Availability and packaging can vary by edition or customer." },
  { source: "Vendor case studies", decision: "Approved with label", use: "Named customer, implementation and stated outcome", boundary: "Vendor-selected evidence; outcome attribution needs care." },
  { source: "Corporate news and filings", decision: "Approved", use: "Leadership, ownership, transactions and announced strategy", boundary: "Use filings or transaction parties for material facts when available." },
  { source: "G2 and Capterra", decision: "Licensed or manual", use: "Directional experience themes, rating, sample and reviewer context", boundary: "Preserve sample size, incentive/source mix and collection date; do not scrape at scale without permission." },
  { source: "Analyst reports", decision: "Licensed only", use: "Market assessment and comparative coverage", boundary: "Do not reproduce paywalled analysis; store citation and licensed excerpts only." },
  { source: "LinkedIn and job postings", decision: "Link-only pending approval", use: "Hiring, geographic and functional investment signals", boundary: "Automated collection may require licensed access and must not infer strategy from one posting." },
  { source: "Reddit and forums", decision: "Directional only", use: "Questions, language, friction themes and discovery leads", boundary: "Never publish as verified fact; identity and representativeness are unknown." },
  { source: "Internal battle cards and interviews", decision: "Access control required", use: "Field positioning, objections, comparative claims and pricing observations", boundary: "Never ship in a public client bundle; every claim needs owner, date and review status." },
];

export const novaraBaseline = {
  name: "Novara Flex",
  domains: ["Core EHS", "Safety & Training", "Sustainability", "Contractor Management", "Chemical & SDS", "Construction Safety", "AI"],
  modules: ["Incident Management", "Audits & Inspections", "Corrective Actions", "Training", "SDS Management", "Asset Management", "Compliance Calendar", "Contractor Management", "ESG & Sustainability", "Forms & Workflows", "Mobile & Offline"],
  strengths: [
    "Configurable forms, workflows and dashboards",
    "Integrated LMS with 1,000+ company-stated courses",
    "Mobile and offline field access",
    "Company-stated access to more than 70 million SDSs",
    "Flex AI positioned around source-backed safety and compliance workflows",
  ],
  sourceUrl: "https://novara.com/ehs-software/",
  aiSourceUrl: "https://novara.com/ehs-software/ai/",
  boundary: "Novara claims are public company statements and must be validated at workflow and packaging level before comparative use.",
};

const observedAt = "2026-08-19";

export const deepCompetitorIntelligence: Record<string, CompetitorIntelligence> = {
  velocityehs: {
    competitorId: "velocityehs",
    researchStatus: "Research pass complete",
    domains: ["Core EHS", "Safety & Training", "Sustainability", "Contractor Management", "Chemical & SDS", "Operational Risk", "AI"],
    industries: ["Manufacturing", "Chemicals", "Food & beverage", "Pharmaceuticals", "Energy", "Retail"],
    headquarters: "Chicago, Illinois",
    founded: "1996",
    marketTier: "Mid-market to global enterprise",
    buyingMotion: "Broad EHS platform with specialist depth in ergonomics and chemical management",
    whyTheyWin: [
      { claim: "Recognized enterprise EHS brand with broad connected-platform coverage.", basis: "VelocityEHS states that Accelerate serves more than 10 million workers and spans eight solution families.", sourceUrl: "https://www.ehs.com/accelerate/" },
      { claim: "Specialist differentiation in ergonomics and chemical management.", basis: "The current platform lists 3D motion capture, ergonomics controls, SDS, inventory, labeling and regulatory reporting capabilities.", sourceUrl: "https://www.ehs.com/accelerate/" },
      { claim: "Clear AI narrative tied to existing EHS workflows.", basis: "VelocityAI and Velo are positioned across predictive incident analytics, ergonomics and in-flow guidance.", sourceUrl: "https://www.ehs.com/press_releases/velocityehs-introduces-velocityai/" },
    ],
    pressurePoints: [
      { signal: "The breadth of the platform makes module-level packaging and workflow depth essential diligence.", boundary: "This is a buying-risk hypothesis, not a verified weakness." },
      { signal: "Public pricing and implementation scope are not disclosed.", boundary: "Requires current quote evidence or approved field intelligence." },
      { signal: "Review evidence must be segmented by product area; the G2 seller profile spans multiple categories.", boundary: "Do not generalize one review theme across the full platform." },
    ],
    ai: { label: "VelocityAI + Velo", summary: "A company-described intelligence layer and embedded assistant across Accelerate.", capabilities: ["3D motion capture", "Predictive incident analytics", "PSIF insights", "Pattern detection", "In-flow guidance"], sourceUrl: "https://www.ehs.com/press_releases/velocityehs-introduces-velocityai/" },
    customerProof: [
      { customer: "Johnson Matthey", industry: "Chemical manufacturing", outcome: "Published ergonomics case study describes use of AI motion capture within a broader ergonomics program.", sourceUrl: "https://www.ehs.com/wp-content/uploads/2025/06/VelocityEHS_Case-Study_Johnson-Matthey.pdf", caveat: "Vendor-published case study; isolate the measured outcome before comparative use." },
    ],
    reviewSignals: [
      { platform: "G2", score: "4.4 / 5", sample: "172 seller-profile reviews", themes: ["Broad category presence", "Self-assessment and access themes", "Mixed collection sources"], sourceUrl: "https://www.g2.com/sellers/velocityehs", caveat: "Observed 2026-08-19. Seller profile spans 14 categories and includes incentivized or seller-invited reviews; analyze product-level cohorts before using themes." },
    ],
    activity: [
      { date: "2025-08-21", type: "AI launch", title: "VelocityAI introduced", summary: "VelocityEHS announced a unified intelligence engine embedded in Accelerate.", sourceUrl: "https://www.ehs.com/press_releases/velocityehs-introduces-velocityai/" },
      { date: "2025-01-29", type: "Platform", title: "Accelerate integration expanded", summary: "The company announced a more unified experience across its major solution families.", sourceUrl: "https://www.ehs.com/press-releases/velocityehs-launches-the-industrys-first-fully-integrated-ehs-platform-to-revolutionize-workplace-safety-and-risk-management/" },
    ],
    questionsToTest: ["Which Accelerate modules are native versus separately packaged?", "What implementation and services are required by module?", "Which AI capabilities are generally available versus limited release?", "How strong is offline support for each frontline workflow?", "How do chemical-list volume and module count affect pricing?"],
    sources: [
      { label: "Accelerate platform", url: "https://www.ehs.com/accelerate/", tier: "Primary", purpose: "Current platform, modules and positioning", observedAt, caveat: "Company statement." },
      { label: "VelocityAI announcement", url: "https://www.ehs.com/press_releases/velocityehs-introduces-velocityai/", tier: "Primary", purpose: "AI launch and named capabilities", observedAt, caveat: "Company announcement." },
      { label: "G2 seller profile", url: "https://www.g2.com/sellers/velocityehs", tier: "Review signal", purpose: "Rating, sample and directional experience themes", observedAt, caveat: "Multiple categories and collection methods." },
    ],
  },
  cority: {
    competitorId: "cority",
    researchStatus: "Research pass complete",
    domains: ["Core EHS", "Sustainability", "Chemical & SDS", "Operational Risk", "AI"],
    industries: ["Manufacturing", "Energy", "Healthcare", "Life sciences", "Public sector", "Transportation"],
    headquarters: "Toronto, Ontario",
    founded: "1985",
    marketTier: "Global enterprise",
    buyingMotion: "Converged EHS+ platform for complex, regulated organizations",
    whyTheyWin: [
      { claim: "Deep enterprise breadth across EHS, occupational health, sustainability and quality.", basis: "CorityOne is positioned as a converged EHS+ platform with shared workflows and data.", sourceUrl: "https://www.cority.com/corityone/" },
      { claim: "Strong occupational-health heritage and complex workflow configurability.", basis: "Current platform coverage and review signals emphasize health records, business rules and accountable workflows.", sourceUrl: "https://www.g2.com/products/corityone/reviews" },
      { claim: "Rapidly expanding governed AI portfolio.", basis: "Cortex AI is presented as a controlled agent layer with 30+ EHS use cases.", sourceUrl: "https://www.cority.com/cortex-ai/" },
    ],
    pressurePoints: [
      { signal: "Review themes indicate setup, navigation and support friction in some complex deployments.", boundary: "Directional G2 signal only; must retain review date, segment and sample." },
      { signal: "Deep configurability can increase implementation and administration diligence.", boundary: "Inference from public product and review evidence, not a universal customer outcome." },
      { signal: "Public pricing is unavailable.", boundary: "Requires current quote evidence." },
    ],
    ai: { label: "Cortex AI", summary: "A governed control center for EHS agents embedded in CorityOne.", capabilities: ["Permit analysis", "Incident image analysis", "Medical scribe", "Audit insight", "Agent governance"], sourceUrl: "https://www.cority.com/cortex-ai/" },
    customerProof: [],
    reviewSignals: [
      { platform: "G2", score: "3.9 / 5", sample: "68 reviews", themes: ["Customization depth", "Centralized occupational health", "Setup and navigation friction", "Mixed support experience"], sourceUrl: "https://www.g2.com/products/corityone/reviews", caveat: "Observed 2026-08-19. Themes are directional and include seller-invited or incentivized reviews." },
    ],
    activity: [
      { date: "2026-01-13", type: "AI launch", title: "Cortex AI introduced", summary: "Cority announced an intelligence layer and agent control center within CorityOne.", sourceUrl: "https://www.cority.com/blog/the-world-of-ehs-is-changing-cortex-ai-is-the-next-step/" },
    ],
    questionsToTest: ["How much implementation effort is required for business rules and migrations?", "Which Cortex agents are generally available today?", "How does mobile and offline depth vary by workflow?", "Which occupational-health workflows are differentiating in the target account?", "How are AI actions audited and governed?"],
    sources: [
      { label: "CorityOne", url: "https://www.cority.com/corityone/", tier: "Primary", purpose: "Platform and solution baseline", observedAt, caveat: "Company statement." },
      { label: "Cortex AI", url: "https://www.cority.com/cortex-ai/", tier: "Primary", purpose: "AI agents and governance", observedAt, caveat: "Company statement; availability requires validation." },
      { label: "G2 CorityOne reviews", url: "https://www.g2.com/products/corityone/reviews", tier: "Review signal", purpose: "Directional usability and support themes", observedAt, caveat: "Mixed reviewer cohorts and collection methods." },
    ],
  },
  "benchmark-gensuite": {
    competitorId: "benchmark-gensuite",
    researchStatus: "Research pass complete",
    domains: ["Core EHS", "Sustainability", "Operational Risk", "Chemical & SDS", "AI"],
    industries: ["Manufacturing", "Chemicals", "Food & beverage", "Pharmaceuticals", "Aerospace", "Oil & gas", "Construction", "Utilities"],
    headquarters: "Mason, Ohio",
    founded: "2010 company profile; platform heritage stated as 25+ years",
    marketTier: "Global enterprise",
    buyingMotion: "Unified, practitioner-led platform emphasizing shared architecture and continuous releases",
    whyTheyWin: [
      { claim: "Unified architecture narrative across EHS, sustainability, quality and operational risk.", basis: "Benchmark states that modules share one data layer, workflows and AI.", sourceUrl: "https://benchmarkgensuite.com/" },
      { claim: "Visible enterprise and manufacturing orientation.", basis: "The company publishes detailed industry coverage and states that it serves 20%+ of the Fortune 500.", sourceUrl: "https://benchmarkgensuite.com/" },
      { claim: "Broad embedded AI story with operational agents.", basis: "Genny AI is described as platform-wide with 20+ integrated tools and multiple agent tiers.", sourceUrl: "https://info.benchmarkgensuite.com/genny-ai-suite-video" },
    ],
    pressurePoints: [
      { signal: "Independent review volume is small relative to the breadth of the platform.", boundary: "G2 has a limited EHS sample; do not overstate sentiment." },
      { signal: "Enterprise breadth requires module-by-module usability and implementation validation.", boundary: "Buying diligence hypothesis." },
      { signal: "Company-published ROI and AI value figures need customer-level corroboration.", boundary: "Treat vendor calculations as vendor proof, not independent fact." },
    ],
    ai: { label: "Genny AI", summary: "Platform-wide AI tools and agents embedded in EHS and sustainability workflows.", capabilities: ["Data quality assistance", "Action summaries", "Risk advisors", "Document and image assistance", "Process agents"], sourceUrl: "https://info.benchmarkgensuite.com/ai-for-ehs-and-sustainability-genny-ai" },
    customerProof: [
      { customer: "ReNew Power", industry: "Renewable energy", outcome: "Published case-study path covers aggregation of safety data and EHS workflow standardization.", sourceUrl: "https://benchmarkgensuite.com/industries/energy/", caveat: "Vendor-published case-study summary." },
    ],
    reviewSignals: [
      { platform: "G2", score: "4.0 / 5", sample: "12 EHS reviews", themes: ["Comprehensive coverage", "Task assignment", "Learning curve"], sourceUrl: "https://www.g2.com/products/benchmark-gensuite-ehs/reviews", caveat: "Observed 2026-08-19. Small sample; several reviews are incentivized or seller-invited." },
    ],
    activity: [
      { date: "2026", type: "AI", title: "Genny AI agent model expanded", summary: "Current product materials describe helper, assistant and process-agent tiers across the platform.", sourceUrl: "https://info.benchmarkgensuite.com/ai-for-ehs-and-sustainability-genny-ai" },
    ],
    questionsToTest: ["Which applications are included in the proposed package?", "What can be configured without services?", "Which Genny capabilities are generally available by module?", "How does offline mobile perform in complex forms?", "What does single-version delivery mean for customer change management?"],
    sources: [
      { label: "Benchmark Gensuite platform", url: "https://benchmarkgensuite.com/", tier: "Primary", purpose: "Platform, industries and public scale claims", observedAt, caveat: "Company statement." },
      { label: "Genny AI", url: "https://info.benchmarkgensuite.com/ai-for-ehs-and-sustainability-genny-ai", tier: "Primary", purpose: "AI model and capabilities", observedAt, caveat: "Company statement and company-calculated value claims." },
      { label: "G2 EHS reviews", url: "https://www.g2.com/products/benchmark-gensuite-ehs/reviews", tier: "Review signal", purpose: "Directional adoption themes", observedAt, caveat: "Small sample." },
    ],
  },
  sphera: {
    competitorId: "sphera",
    researchStatus: "Research pass complete",
    domains: ["Core EHS", "Sustainability", "Operational Risk", "Chemical & SDS", "AI"],
    industries: ["Chemicals", "Life sciences", "Manufacturing", "Energy", "Food & beverage", "Water"],
    headquarters: "Chicago, Illinois",
    marketTier: "Global enterprise",
    buyingMotion: "Operational-risk and sustainability platform with proprietary content and data",
    whyTheyWin: [
      { claim: "Distinct breadth across EHS, process safety, product stewardship and supply-chain risk.", basis: "Sphera positions its portfolio around operational resilience and sustainability rather than EHS alone.", sourceUrl: "https://sphera.com/solutions/" },
      { claim: "Proprietary regulatory and sustainability datasets strengthen the data story.", basis: "Sphera states that its AI uses 500,000+ emissions factors and 20,000 annually updated third-party-verified LCA datasets.", sourceUrl: "https://sphera.com/company/news/sphera-ai-supercharges-data-to-address-sustainability-and-operational-resilience-challenges/" },
      { claim: "Strong evidence in complex global manufacturing deployments.", basis: "Named customer stories describe multilingual and global safety rollouts.", sourceUrl: "https://sphera.com/resources/case-study/how-grundfos-transformed-workplace-safety-with-spheracloud-software-2/" },
    ],
    pressurePoints: [
      { signal: "Portfolio breadth spans several buying centers and requires clarity on product integration and packaging.", boundary: "Buying diligence hypothesis." },
      { signal: "Customer outcomes are vendor-published and may include process changes beyond software.", boundary: "Do not attribute all outcome movement to the platform." },
      { signal: "Public pricing is unavailable.", boundary: "Requires current quote evidence." },
    ],
    ai: { label: "Sphera AI", summary: "AI activated across proprietary sustainability, chemical and operational-risk data.", capabilities: ["Product carbon footprint", "Supplier-risk prediction", "Incident prediction", "Chemical compliance guidance"], sourceUrl: "https://sphera.com/company/news/sphera-ai-supercharges-data-to-address-sustainability-and-operational-resilience-challenges/" },
    customerProof: [
      { customer: "Grundfos", industry: "Water solutions / manufacturing", outcome: "Vendor case study reports global safety-data visibility, a 16% lost-time-injury-ratio reduction from 2021–2024 and 95% hazard-observation correction closure in 2024.", sourceUrl: "https://sphera.com/resources/case-study/how-grundfos-transformed-workplace-safety-with-spheracloud-software-2/", caveat: "Vendor-published; AI analysis in the case also used Microsoft Copilot and Power BI." },
      { customer: "Danone", industry: "Food & beverage", outcome: "Vendor case study reports a 796% increase in safety observations and a 21% frequency-rate reduction between 2021 and 2024.", sourceUrl: "https://sphera.com/resources/case-study/danone-driving-consistent-safety-performance-at-global-scale/", caveat: "Vendor-published; outcome attribution includes broader safety transformation." },
    ],
    reviewSignals: [],
    activity: [
      { date: "2025", type: "AI", title: "Sphera AI positioned across the portfolio", summary: "The company announced AI use cases across sustainability, supply-chain risk, EHS and product stewardship.", sourceUrl: "https://sphera.com/company/news/sphera-ai-supercharges-data-to-address-sustainability-and-operational-resilience-challenges/" },
    ],
    questionsToTest: ["Which SpheraCloud products share data and workflow natively?", "How are proprietary data subscriptions packaged?", "Which AI capabilities are available to EHS buyers today?", "What is the implementation model for global rollouts?", "Where does Control of Work require separate configuration or services?"],
    sources: [
      { label: "Sphera solutions", url: "https://sphera.com/solutions/", tier: "Primary", purpose: "Portfolio map", observedAt, caveat: "Company statement." },
      { label: "Sphera AI announcement", url: "https://sphera.com/company/news/sphera-ai-supercharges-data-to-address-sustainability-and-operational-resilience-challenges/", tier: "Primary", purpose: "AI and proprietary-data claims", observedAt, caveat: "Company statement." },
      { label: "Grundfos case study", url: "https://sphera.com/resources/case-study/how-grundfos-transformed-workplace-safety-with-spheracloud-software-2/", tier: "Vendor proof", purpose: "Named implementation and outcome", observedAt, caveat: "Vendor-selected case study." },
    ],
  },
  intelex: {
    competitorId: "intelex",
    researchStatus: "Research pass complete",
    domains: ["Core EHS", "Sustainability", "Operational Risk", "Construction Safety", "AI"],
    industries: ["Construction", "Manufacturing", "Transportation", "Chemicals", "Metals & mining", "Energy"],
    headquarters: "Toronto, Ontario",
    founded: "1992",
    marketTier: "Mid-market to global enterprise",
    buyingMotion: "Flexible EHSQ platform spanning safety, quality and sustainability",
    whyTheyWin: [
      { claim: "Broad configurable EHSQ platform with strong industry coverage.", basis: "Intelex publishes solution depth across safety, quality, environment and sustainability for multiple industrial verticals.", sourceUrl: "https://www.intelex.com/" },
      { claim: "Longer-running AI investment than many current market narratives suggest.", basis: "Intelex traces product investment through SafetyNet predictive analytics and ehsAI regulatory-document parsing acquisitions.", sourceUrl: "https://www.intelex.com/about/press-room/intelex-introduces-input-ai-and-insight-ai-two-strategic-pillars-that-transform-how-organizations-capture-ehsq-data-and-extract-actionable-intelligence/" },
      { claim: "Named safety outcomes in metals manufacturing.", basis: "The Kloeckner case study publishes improvements across OSHA recordables, restricted duty, lost time and employee engagement.", sourceUrl: "https://www.intelex.com/clients/case-studies/kloeckner/" },
    ],
    pressurePoints: [
      { signal: "Flexibility requires implementation, governance and administrator-effort diligence.", boundary: "Buying diligence hypothesis." },
      { signal: "AI pillars combine acquired and native capabilities; buyers should validate architecture and availability by workflow.", boundary: "Inference from the company acquisition history and current announcement." },
      { signal: "Public pricing is unavailable.", boundary: "Requires current quote evidence." },
    ],
    ai: { label: "Input AI + Insight AI", summary: "Two pillars covering higher-quality data capture and predictive or analytical insight.", capabilities: ["Language and vision input", "Predictive analytics", "Regulatory-document parsing", "Data-quality assistance", "Forecasting"], sourceUrl: "https://www.intelex.com/about/press-room/intelex-introduces-input-ai-and-insight-ai-two-strategic-pillars-that-transform-how-organizations-capture-ehsq-data-and-extract-actionable-intelligence/" },
    customerProof: [
      { customer: "Kloeckner Metals", industry: "Metals manufacturing", outcome: "Vendor case study reports 55% lower OSHA recordables, 43% fewer restricted-duty cases and 62% fewer lost-time injuries versus its cited baseline.", sourceUrl: "https://www.intelex.com/clients/case-studies/kloeckner/", caveat: "Vendor-published and based on customer-reported program outcomes." },
    ],
    reviewSignals: [],
    activity: [
      { date: "2025-11-25", type: "AI strategy", title: "Input AI and Insight AI announced", summary: "Intelex formalized its AI portfolio around data capture and actionable intelligence.", sourceUrl: "https://www.intelex.com/about/press-room/intelex-introduces-input-ai-and-insight-ai-two-strategic-pillars-that-transform-how-organizations-capture-ehsq-data-and-extract-actionable-intelligence/" },
    ],
    questionsToTest: ["What administrator effort is required after implementation?", "Which AI capabilities are native versus inherited from acquired products?", "How are environmental, quality and safety data unified?", "What offline workflows are supported?", "What services are needed to reproduce published customer outcomes?"],
    sources: [
      { label: "Intelex platform", url: "https://www.intelex.com/", tier: "Primary", purpose: "Positioning, industries and solution map", observedAt, caveat: "Company statement." },
      { label: "AI strategy announcement", url: "https://www.intelex.com/about/press-room/intelex-introduces-input-ai-and-insight-ai-two-strategic-pillars-that-transform-how-organizations-capture-ehsq-data-and-extract-actionable-intelligence/", tier: "Primary", purpose: "AI history and capabilities", observedAt, caveat: "Company announcement." },
      { label: "Kloeckner case study", url: "https://www.intelex.com/clients/case-studies/kloeckner/", tier: "Vendor proof", purpose: "Named outcome evidence", observedAt, caveat: "Vendor-selected case study." },
    ],
  },
  hsi: {
    competitorId: "hsi",
    researchStatus: "Research pass complete",
    domains: ["Core EHS", "Safety & Training", "Sustainability", "Contractor Management", "Chemical & SDS", "Operational Risk", "AI"],
    industries: ["Manufacturing", "Utilities", "Construction", "Healthcare", "Transportation", "Public sector"],
    headquarters: "Frisco, Texas",
    marketTier: "SMB to enterprise",
    buyingMotion: "Combined EHS, training and chemical-management platform",
    whyTheyWin: [
      { claim: "A combined EHS and training proposition with broad content depth.", basis: "HSI markets more than 30 EHS modules and a training library exceeding 5,000 courses.", sourceUrl: "https://hsi.com/solutions/ehs-environmental-health-and-safety/platform-overview" },
      { claim: "Configurable module model with custom-module support.", basis: "The platform is positioned around adding, removing and tailoring modules without developers.", sourceUrl: "https://hsi.com/solutions/ehs-environmental-health-and-safety/platform-overview" },
      { claim: "AI is linked across EHS records, documents and training search.", basis: "HSI announced incident summaries, document creation and training-library search within its platform.", sourceUrl: "https://hsi.com/news/hsi-announces-ai-for-ehs-training" },
    ],
    pressurePoints: [
      { signal: "Buyers should validate how acquired product surfaces share one data and permission model.", boundary: "Architecture diligence hypothesis; requires product proof." },
      { signal: "A large content and module catalog makes packaging clarity essential.", boundary: "Buying diligence hypothesis." },
      { signal: "AI capability maturity varies by announced feature and date.", boundary: "Confirm current general availability." },
    ],
    ai: { label: "HSI AI + Sky", summary: "AI assistance across EHS summaries, document creation, training search and emerging hazard guidance.", capabilities: ["Record summaries", "Document creation", "Training search", "Image hazard detection", "Contextual assistant"], sourceUrl: "https://hsi.com/news/hsi-announces-ai-for-ehs-training" },
    customerProof: [],
    reviewSignals: [],
    activity: [
      { date: "2024-01-23", type: "AI launch", title: "In-platform AI announced", summary: "HSI launched AI summaries, AI document creation and AI-enhanced training search.", sourceUrl: "https://hsi.com/news/hsi-announces-ai-for-ehs-training" },
    ],
    questionsToTest: ["Which modules share workflows and reporting natively?", "How are EHS and LMS permissions synchronized?", "Which Sky capabilities are generally available?", "What is included versus separately packaged?", "How much configuration can administrators perform without services?"],
    sources: [
      { label: "HSI platform overview", url: "https://hsi.com/solutions/ehs-environmental-health-and-safety/platform-overview", tier: "Primary", purpose: "Module and platform baseline", observedAt, caveat: "Company statement." },
      { label: "HSI AI announcement", url: "https://hsi.com/news/hsi-announces-ai-for-ehs-training", tier: "Primary", purpose: "Named AI capabilities", observedAt, caveat: "Company announcement; confirm current availability." },
    ],
  },
  "ehs-insight": {
    competitorId: "ehs-insight",
    researchStatus: "Research pass complete",
    domains: ["Core EHS", "Safety & Training", "Sustainability", "Chemical & SDS", "Operational Risk", "Construction Safety", "AI"],
    industries: ["Manufacturing", "Construction", "Energy", "Chemicals", "Mining"],
    headquarters: "Houston, Texas",
    founded: "2009",
    marketTier: "Mid-market to enterprise",
    buyingMotion: "Modular EHS platform positioned around faster deployment and lower complexity",
    whyTheyWin: [
      { claim: "Broad modular EHS coverage with public packaging language.", basis: "EHS Insight states that customers can subscribe to one or more of 32 modules.", sourceUrl: "https://www.ehsinsight.com/solutions/platform/pricing" },
      { claim: "Strong frontline and mid-market simplicity narrative.", basis: "Current positioning emphasizes offline mobile, deployment in weeks and configuration without enterprise-suite overhead.", sourceUrl: "https://get.ehsinsight.com/ehs-management-system/" },
      { claim: "AI is positioned across data quality, documents, images and SIF precursor detection.", basis: "Current product materials list AI Copilot and multiple safety-specific AI functions.", sourceUrl: "https://www.ehsinsight.com/hubfs/EHS%20Insights%20AI%20Copilot.pdf" },
    ],
    pressurePoints: [
      { signal: "Competitor-comparison pages are vendor-authored and should not be treated as independent evidence.", boundary: "Use only to understand EHS Insight messaging strategy." },
      { signal: "Public pages describe modular pricing but do not provide current price levels.", boundary: "Requires current quote evidence." },
      { signal: "AI production status must be verified by capability and package.", boundary: "Company statement until product proof is captured." },
    ],
    ai: { label: "EHS Insight AI Copilot", summary: "Safety-focused AI spanning data quality, documents, images and workflow assistance.", capabilities: ["SIF precursor detection", "Custom agents", "Data-quality analysis", "Document AI", "Vision AI", "SDS assistance"], sourceUrl: "https://www.ehsinsight.com/hubfs/EHS%20Insights%20AI%20Copilot.pdf" },
    customerProof: [
      { customer: "Bristol Bay Industrial", industry: "Industrial services", outcome: "Vendor page states more than $200,000 in savings after automating more than 40 paper-based EHS processes.", sourceUrl: "https://get.ehsinsight.com/ehs-management-system/", caveat: "Vendor-published summary; underlying calculation should be obtained before comparative use." },
    ],
    reviewSignals: [],
    activity: [
      { date: "2026", type: "Messaging", title: "Enterprise capability at mid-market speed", summary: "Current campaigns explicitly contrast focused EHS deployment with larger enterprise suites.", sourceUrl: "https://www.ehsinsight.com/blog/ehs-insight-vs-benchmark-gensuite-focused-ehs-management-vs-an-enterprise-global-suite" },
    ],
    questionsToTest: ["Which 32 modules are most mature and most commonly bundled?", "How does configuration scale across global multi-site programs?", "Which AI functions are included in the standard package?", "How strong are enterprise integrations and governance?", "What support model accompanies faster deployment?"],
    sources: [
      { label: "Pricing and module FAQ", url: "https://www.ehsinsight.com/solutions/platform/pricing", tier: "Primary", purpose: "Module count and packaging language", observedAt, caveat: "No public price levels." },
      { label: "EHS management campaign", url: "https://get.ehsinsight.com/ehs-management-system/", tier: "Primary", purpose: "Positioning, features and customer proof", observedAt, caveat: "Campaign page and vendor claims." },
      { label: "AI Copilot brief", url: "https://www.ehsinsight.com/hubfs/EHS%20Insights%20AI%20Copilot.pdf", tier: "Primary", purpose: "AI capability map", observedAt, caveat: "Company statement; validate availability." },
    ],
  },
};

export function inferDomains(modules: string[], messagingTags: string[]) {
  const text = [...modules, ...messagingTags].join(" ").toLowerCase();
  const domains = ["Core EHS"];
  if (/training|learning|lms|workforce readiness/.test(text)) domains.push("Safety & Training");
  if (/sustainability|esg|carbon|emissions/.test(text)) domains.push("Sustainability");
  if (/contractor|supplier|prequalification/.test(text)) domains.push("Contractor Management");
  if (/chemical|sds|hazardous/.test(text)) domains.push("Chemical & SDS");
  if (/operational risk|process safety|control of work|risk management/.test(text)) domains.push("Operational Risk");
  if (/construction/.test(text)) domains.push("Construction Safety");
  if (/\bai\b|artificial intelligence|predictive|machine learning/.test(text)) domains.push("AI");
  return [...new Set(domains)];
}
