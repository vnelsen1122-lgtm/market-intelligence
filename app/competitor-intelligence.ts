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
  productDepth?: Array<{
    family: string;
    depth: "Specialist depth" | "Broad workflow coverage" | "Adjacent capability" | "Baseline only";
    workflows: string[];
    buyerUse: string;
    assessment: string;
    watchouts: string[];
    sourceUrl: string;
  }>;
  messaging?: {
    headline: string;
    promise: string;
    pillars: Array<{ label: string; evidence: string }>;
    changeSummary: string;
    sourceUrl: string;
  };
  corporateSignals?: Array<{ date: string; type: string; title: string; summary: string; sourceUrl: string }>;
  hiringSignals?: Array<{ function: string; signal: string; interpretation: string; sourceUrl: string; observedAt: string }>;
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
    productDepth: [
      { family: "Safety", depth: "Broad workflow coverage", workflows: ["Incident management", "Investigations and root-cause analysis", "Audits and inspections", "Observations", "Corrective actions", "Safety meetings", "Training and learning"], buyerUse: "Standardize frontline reporting, investigations, actions and recurring safety work across sites.", assessment: "A broad safety system rather than a single incident-recording tool. The public product map connects capture, investigation, action management and learning workflows.", watchouts: ["Confirm OSHA recordability configuration by geography", "Test cross-module navigation and field workflow steps", "Validate offline behavior by workflow"], sourceUrl: "https://www.ehs.com/solution/safety/" },
      { family: "Chemical Management", depth: "Specialist depth", workflows: ["SDS management", "Chemical inventory", "GHS secondary labeling", "Ingredient indexing", "Regulatory reporting", "Emergency response"], buyerUse: "Control chemical inventories and hazard communication while maintaining accessible SDS and reporting records.", assessment: "One of VelocityEHS's clearest specialist positions, extending beyond SDS storage into inventory, labels, ingredient data and reporting.", watchouts: ["Validate SDS update timing", "Confirm regulatory-content coverage by country", "Test synchronization across locations and modules"], sourceUrl: "https://www.ehs.com/accelerate/" },
      { family: "Ergonomics", depth: "Specialist depth", workflows: ["Industrial ergonomics", "Office ergonomics", "3D motion-capture assessment", "3DSSPP analysis", "Controls and improvement tracking"], buyerUse: "Identify ergonomic risk, prioritize controls and show injury and cost movement over time.", assessment: "A differentiated specialist franchise supported by computer-vision tooling, consulting heritage and multiple quantified customer stories.", watchouts: ["Separate software effect from broader program change", "Confirm assessment hardware and service requirements", "Validate coverage for non-routine work"], sourceUrl: "https://www.ehs.com/accelerate/" },
      { family: "Operational Risk", depth: "Specialist depth", workflows: ["Hazard studies", "Bowtie analysis", "JSA and JHA", "Management of change", "Control verification", "Risk dashboards"], buyerUse: "Model major hazards, connect critical controls and manage operational change in high-hazard environments.", assessment: "Deeper than conventional EHS action tracking and relevant to process safety, energy, chemicals and complex manufacturing buyers.", watchouts: ["Confirm integration between risk studies and frontline execution", "Validate facilitator and services dependence", "Test reporting across inherited data models"], sourceUrl: "https://www.ehs.com/solution/operational-risk/" },
      { family: "Contractor Safety & Permit to Work", depth: "Broad workflow coverage", workflows: ["Contractor onboarding", "Qualification", "Permit to work", "Site access", "Contractor performance"], buyerUse: "Control contractor eligibility and hazardous work before and during site access.", assessment: "The OneLook acquisition added permit-to-work and contractor-management depth to the broader Accelerate portfolio.", watchouts: ["Confirm network versus site-owned data model", "Validate permit workflow configuration", "Assess contractor adoption outside managed sites"], sourceUrl: "https://www.ehs.com/press_releases/velocityehs-adds-innovative-permit-to-work-and-contractor-management-capabilities-with-acquisition-of-onelook-systems/" },
      { family: "Environmental Compliance", depth: "Broad workflow coverage", workflows: ["Permit obligations", "Compliance tasks", "Environmental reporting", "Air, water and waste records"], buyerUse: "Track obligations and evidence across regulated facilities and reporting periods.", assessment: "A named Accelerate solution family with shared workflow positioning; detailed jurisdictional content depth requires module-level validation.", watchouts: ["Confirm included regulatory content", "Validate calculation and filing workflows", "Assess jurisdiction coverage"], sourceUrl: "https://www.ehs.com/accelerate/" },
      { family: "Sustainability", depth: "Broad workflow coverage", workflows: ["ESG data collection", "GHG accounting", "Performance reporting", "Multi-site sustainability management"], buyerUse: "Collect and report sustainability data alongside EHS operations.", assessment: "Positioned as part of the connected platform, but buyers should validate calculation libraries, assurance controls and disclosure-specific workflows.", watchouts: ["Confirm emissions-factor governance", "Validate audit trail and assurance support", "Check disclosure framework coverage"], sourceUrl: "https://www.ehs.com/accelerate/" },
      { family: "Industrial Hygiene", depth: "Broad workflow coverage", workflows: ["Exposure assessment", "Sampling plans", "Similar exposure groups", "Medical and monitoring records"], buyerUse: "Manage occupational exposure programs and recurring industrial-hygiene work.", assessment: "A distinct solution family that strengthens VelocityEHS in regulated manufacturing and high-exposure environments.", watchouts: ["Confirm lab and device integrations", "Validate statistical analysis depth", "Assess occupational-health handoffs"], sourceUrl: "https://www.ehs.com/accelerate/" },
    ],
    messaging: {
      headline: "One platform. One intelligence. One assistant.",
      promise: "Move from risk to resolution faster by connecting EHS workflows, data and AI in the Accelerate platform.",
      pillars: [
        { label: "Speed", evidence: "Current platform language repeatedly emphasizes speed, reduced administrative work and faster movement from detection to action." },
        { label: "Connected platform", evidence: "Accelerate is presented as a shared experience across eight solution families rather than a collection of isolated tools." },
        { label: "Human-centered intelligence", evidence: "VelocityAI is framed as intelligence embedded in the flow of EHS work, with Velo as the interaction layer." },
        { label: "Practical outcomes", evidence: "Case studies foreground injury reduction, multi-site standardization and operational efficiency rather than abstract transformation." },
      ],
      changeSummary: "The message has shifted from broad EHS platform consolidation toward an AI-led three-layer story: Accelerate as the work layer, VelocityAI as the intelligence layer and Velo as the assistant.",
      sourceUrl: "https://www.ehs.com/accelerate/",
    },
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
      { customer: "Johnson Matthey", industry: "Chemical manufacturing", outcome: "Vendor case study reports a 97% reduction in recordable ergonomic injuries over five years using Industrial Ergonomics within a broader program.", sourceUrl: "https://www.ehs.com/wp-content/uploads/2025/06/VelocityEHS_Case-Study_Johnson-Matthey.pdf", caveat: "Vendor-published outcome; program, process and software effects are not independently isolated." },
      { customer: "Hitachi Energy", industry: "Energy equipment manufacturing", outcome: "Vendor success story reports a 95% reduction in neck and back injury incidence using Industrial Ergonomics.", sourceUrl: "https://www.ehs.com/success-stories/", caveat: "Vendor-selected case-study result; validate measurement period and program scope before comparison." },
      { customer: "Komatsu Mining Technologies", industry: "Mining equipment manufacturing", outcome: "The current success story describes one safety system supporting more than 150 sites and a global operating model.", sourceUrl: "https://www.ehs.com/success-stories/", caveat: "Vendor-published account of adoption and scale; implementation effort and active-module coverage are not independently verified." },
      { customer: "Porter Logistics", industry: "Logistics and regulated materials", outcome: "The case study describes replacement of spreadsheet-based chemical work with Chemical Management as the company expanded into regulated customer environments.", sourceUrl: "https://www.ehs.com/case-studies/porter-logistics/", caveat: "Vendor-published qualitative outcome; no independent ROI measure is provided." },
      { customer: "Biomedical device manufacturer", industry: "Medical device manufacturing", outcome: "The success story describes contractor-safety process improvement, time savings and lower administrative cost.", sourceUrl: "https://www.ehs.com/success-stories/", caveat: "Customer is unnamed and outcomes are vendor-published; use as workflow evidence, not market proof." },
    ],
    reviewSignals: [
      { platform: "G2", score: "4.4 / 5", sample: "155 product reviews", themes: ["Ease of use is the dominant positive theme", "Centralized safety, chemical and compliance records", "Useful dashboards and recurring-action tracking", "Navigation can feel confusing or fragmented", "Some workflows feel rigid or require extra steps", "Support response and OSHA-recordability setup appear as diligence themes"], sourceUrl: "https://www.g2.com/products/velocityehs-ehs-software-to-outpace-risk/reviews", caveat: "Observed 2026-08-20. G2 reports verified identities, but the visible sample includes seller-invited and incentivized reviews. Treat themes as directional and segment by module and reviewer context." },
    ],
    activity: [
      { date: "2025-08-21", type: "AI launch", title: "VelocityAI introduced", summary: "VelocityEHS announced a unified intelligence engine embedded in Accelerate.", sourceUrl: "https://www.ehs.com/press_releases/velocityehs-introduces-velocityai/" },
      { date: "2025-01-29", type: "Platform", title: "Accelerate integration expanded", summary: "The company announced a more unified experience across its major solution families.", sourceUrl: "https://www.ehs.com/press-releases/velocityehs-launches-the-industrys-first-fully-integrated-ehs-platform-to-revolutionize-workplace-safety-and-risk-management/" },
      { date: "2025-07-01", type: "AI product", title: "AI PSIF Insights added to Incident Management", summary: "VelocityEHS launched an AI feature intended to identify potential serious-injury and fatality precursors within incident workflows.", sourceUrl: "https://www.ehs.com/press_releases/velocityehs-launches-new-psif-ai-to-identify-the-next-serious-injury-or-fatality-before-it-happens/" },
      { date: "2025-01-14", type: "Partnership", title: "Ergonomics services partnership expanded", summary: "A partnership with Sandalwood added specialist services around Industrial Ergonomics deployments.", sourceUrl: "https://www.ehs.com/press_releases/velocityehs-continues-its-mission-to-reduce-workplace-injuries-by-establishing-new-ergonomics-partner/" },
    ],
    corporateSignals: [
      { date: "2025-08-21", type: "Strategy", title: "AI becomes the platform-level growth narrative", summary: "VelocityAI and Velo connect the portfolio under a common intelligence and assistant story rather than positioning AI as an isolated feature.", sourceUrl: "https://www.ehs.com/press_releases/velocityehs-introduces-velocityai/" },
      { date: "2025-01-14", type: "Partner ecosystem", title: "Services capacity added around ergonomics", summary: "The Sandalwood partnership indicates continued investment in implementation and expert support around a differentiated product franchise.", sourceUrl: "https://www.ehs.com/press_releases/velocityehs-continues-its-mission-to-reduce-workplace-injuries-by-establishing-new-ergonomics-partner/" },
      { date: "2021-05-12", type: "Acquisition", title: "OneLook Systems acquired", summary: "The acquisition added permit-to-work and contractor-management capabilities and established a stronger control-of-work position.", sourceUrl: "https://www.ehs.com/press_releases/velocityehs-adds-innovative-permit-to-work-and-contractor-management-capabilities-with-acquisition-of-onelook-systems/" },
    ],
    hiringSignals: [
      { function: "Go-to-market enablement", signal: "GTM Communication & Enablement Manager listed on the official careers page", interpretation: "Supports investment in more consistent commercial narrative, field readiness and launch communication; it does not by itself establish growth rate.", sourceUrl: "https://www.ehs.com/about-us/careers/open-positions/", observedAt: "2026-08-20" },
      { function: "Enterprise sales", signal: "Global Enterprise Account Manager and Enterprise Account Manager roles listed", interpretation: "Consistent with continued enterprise-account coverage and upmarket selling capacity; open-role counts are a point-in-time signal only.", sourceUrl: "https://www.ehs.com/about-us/careers/open-positions/", observedAt: "2026-08-20" },
    ],
    questionsToTest: ["Which Accelerate modules are native versus separately packaged?", "What implementation and services are required by module?", "Which AI capabilities are generally available versus limited release?", "How strong is offline support for each frontline workflow?", "How do chemical-list volume and module count affect pricing?"],
    sources: [
      { label: "Accelerate platform", url: "https://www.ehs.com/accelerate/", tier: "Primary", purpose: "Current platform, modules and positioning", observedAt, caveat: "Company statement." },
      { label: "VelocityAI announcement", url: "https://www.ehs.com/press_releases/velocityehs-introduces-velocityai/", tier: "Primary", purpose: "AI launch and named capabilities", observedAt, caveat: "Company announcement." },
      { label: "G2 seller profile", url: "https://www.g2.com/sellers/velocityehs", tier: "Review signal", purpose: "Rating, sample and directional experience themes", observedAt, caveat: "Multiple categories and collection methods." },
      { label: "VelocityEHS success stories", url: "https://www.ehs.com/success-stories/", tier: "Vendor proof", purpose: "Named customers, industries and stated outcomes", observedAt, caveat: "Vendor-selected customer evidence." },
      { label: "VelocityEHS careers", url: "https://www.ehs.com/about-us/careers/open-positions/", tier: "Primary", purpose: "Point-in-time hiring signals", observedAt, caveat: "Open roles change and do not prove strategy or performance alone." },
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
  "vector-solutions": {
    competitorId: "vector-solutions",
    researchStatus: "Research pass complete",
    domains: ["Core EHS", "Safety & Training", "Operational Risk", "Construction Safety", "AI"],
    industries: ["Manufacturing", "Architecture, engineering & construction", "Transportation", "Higher education", "Government", "Hospitality"],
    headquarters: "Tampa, Florida",
    marketTier: "Mid-market to enterprise",
    buyingMotion: "EHS software paired with a large workforce-training and professional-development portfolio",
    whyTheyWin: [
      { claim: "Safety software and training sit within one broader workforce-readiness portfolio.", basis: "Vector positions its EHS platform alongside a large safety and professional-training catalog for industrial and public-sector buyers.", sourceUrl: "https://www.vectorsolutions.com/solutions/vector-ehs-management-software/" },
      { claim: "Clear fit for distributed frontline organizations that need practical reporting workflows.", basis: "The platform publishes incident, hazard, JSA, inspection, claims, environmental and OSHA reporting workflows across multiple industries.", sourceUrl: "https://www.vectorsolutions.com/solutions/vector-ehs-management-software/" },
      { claim: "Recent AI releases connect incident capture to training recommendations.", basis: "Vector announced Incident Assistant in 2025 and an AI Safety Training Recommendation Engine in 2026.", sourceUrl: "https://www.vectorsolutions.com/resources/press-releases/vector-solutions-launches-ai-safety-training/" },
    ],
    pressurePoints: [
      { signal: "The broader Vector portfolio makes product-line, data-model and entitlement boundaries important diligence.", boundary: "Architecture and packaging hypothesis; validate in a current demo." },
      { signal: "Published outcome stories combine software, training and broader safety-program changes.", boundary: "Do not attribute the full outcome to one Vector module." },
      { signal: "Public pricing is unavailable.", boundary: "Requires current quote evidence." },
    ],
    ai: { label: "Vector AI", summary: "Workflow assistance for clearer incident records, hazard signals and safety-training recommendations.", capabilities: ["Incident narrative guidance", "Data-quality prompts", "Training recommendations", "Hazard-pattern support", "Course-content assistance"], sourceUrl: "https://www.vectorsolutions.com/solutions/vector-ai-product-features/" },
    customerProof: [
      { customer: "Rockline Industries", industry: "Manufacturing", outcome: "Vendor story describes centralized safety data and improved analysis across manufacturing operations.", sourceUrl: "https://www.vectorsolutions.com/resources/success-stories/rockline-industries-improves-its-safety-data-analysis-with-vector-ehs/", caveat: "Vendor-published customer story; validate measured baselines." },
      { customer: "Mahoney Environmental", industry: "Environmental services", outcome: "Vendor story reports a 60% workers-compensation decrease in the first year and more than $2.2 million in reduction after combining EHS and learning workflows.", sourceUrl: "https://www.vectorsolutions.com/resources/success-stories/delivering-individualized-training-at-scale-at-mahoney-environmental/", caveat: "Vendor-published; multiple program factors contributed to the stated outcome." },
    ],
    reviewSignals: [],
    activity: [
      { date: "2026-01-07", type: "AI launch", title: "AI safety-training recommendations launched", summary: "Vector announced recommendations that connect EHS signals with assigned safety learning.", sourceUrl: "https://www.vectorsolutions.com/resources/press-releases/vector-solutions-launches-ai-safety-training/" },
      { date: "2025-09", type: "AI launch", title: "Incident Assistant announced", summary: "Vector introduced guided AI support for clearer and more accurate incident capture.", sourceUrl: "https://www.vectorsolutions.com/resources/newsroom/vector-solutions-launches-ai-powered-incident-assistant-to-capture-clearer-more-accurate-data-in-vector-ehs-platform/" },
      { date: "2019-07-22", type: "Acquisition", title: "IndustrySafe acquired", summary: "Vector acquired IndustrySafe, the foundation of its EHS management offering.", sourceUrl: "https://www.vectorsolutions.com/resources/press-releases/vector-solutions-acquires-industrysafe/" },
    ],
    questionsToTest: ["Which EHS and LMS records share one identity and analytics layer?", "Which AI features are generally available by package?", "How deep are environmental-compliance and industrial-hygiene workflows?", "What offline workflows are supported?", "How are training recommendations reviewed and governed?"],
    sources: [
      { label: "Vector EHS platform", url: "https://www.vectorsolutions.com/solutions/vector-ehs-management-software/", tier: "Primary", purpose: "Modules, industries and platform positioning", observedAt, caveat: "Company statement." },
      { label: "Vector AI product features", url: "https://www.vectorsolutions.com/solutions/vector-ai-product-features/", tier: "Primary", purpose: "Current AI portfolio", observedAt, caveat: "Company statement; availability may vary." },
      { label: "Mahoney Environmental story", url: "https://www.vectorsolutions.com/resources/success-stories/delivering-individualized-training-at-scale-at-mahoney-environmental/", tier: "Vendor proof", purpose: "Named implementation and outcome", observedAt, caveat: "Vendor-selected story with multiple contributing factors." },
    ],
  },
  hammertech: {
    competitorId: "hammertech",
    researchStatus: "Research pass complete",
    domains: ["Core EHS", "Contractor Management", "Construction Safety", "AI"],
    industries: ["Commercial construction", "General contracting", "Data-center construction", "Civil construction", "Residential construction"],
    headquarters: "Melbourne, Australia; North American office in Chicago",
    founded: "2013",
    marketTier: "Construction mid-market to enterprise",
    buyingMotion: "Construction-specific safety and site-operations platform for general contractors and subcontractor ecosystems",
    whyTheyWin: [
      { claim: "Construction specialization shapes the workflows rather than adapting a horizontal EHS suite.", basis: "HammerTech presents 16 interconnected modules around inductions, permits, pre-starts, equipment, incidents and subcontractor work.", sourceUrl: "https://www.hammertech.com/en-us/product/platform" },
      { claim: "Strong named-customer presence among large general contractors.", basis: "The current customer directory highlights more than 500 contractors and names Holder, DPR, PCL, Gilbane and others.", sourceUrl: "https://www.hammertech.com/en-us/customers" },
      { claim: "Current positioning connects field participation to portfolio-level safety intelligence.", basis: "HammerTech Intelligence is presented as AI support for observation quality, trend detection and proactive risk prevention.", sourceUrl: "https://www.hammertech.com/en-us/blog/how-holder-construction-improved-safety-observations-with-ai" },
    ],
    pressurePoints: [
      { signal: "Construction depth should be compared separately from environmental, occupational-health and sustainability breadth.", boundary: "Category boundary, not a product weakness." },
      { signal: "Published efficiency figures are company-selected and workflow-specific.", boundary: "Require customer context and baseline before comparative use." },
      { signal: "AI availability and underlying methods need module-level validation.", boundary: "Company statement until demonstrated in the target workflow." },
    ],
    ai: { label: "HammerTech Intelligence", summary: "Construction-focused assistance intended to improve observations and surface earlier jobsite risk signals.", capabilities: ["Observation analysis", "Photo-supported risk identification", "Portfolio trends", "Proactive risk signals", "Construction safety reporting"], sourceUrl: "https://www.hammertech.com/en-us/blog/how-holder-construction-improved-safety-observations-with-ai" },
    customerProof: [
      { customer: "Holder Construction", industry: "General contracting", outcome: "Vendor story describes expansion from digital safety records toward AI-assisted observation analysis and earlier risk prevention.", sourceUrl: "https://www.hammertech.com/en-us/blog/how-holder-construction-improved-safety-observations-with-ai", caveat: "Vendor-published; no independent causal validation." },
      { customer: "MJ Conroy", industry: "Construction", outcome: "Vendor buyer guide describes replacement of paper processes and centralized collaboration across more than 100 subcontractors.", sourceUrl: "https://www.hammertech.com/hubfs/UKI_Buyers_Guide_v1.pdf?hsLang=en-gb", caveat: "Vendor-published buyer guide." },
    ],
    reviewSignals: [],
    activity: [
      { date: "2026-05-27", type: "AI customer proof", title: "Holder AI observation story published", summary: "HammerTech documented how Holder is applying its intelligence layer to safety observations.", sourceUrl: "https://www.hammertech.com/en-us/blog/how-holder-construction-improved-safety-observations-with-ai" },
    ],
    questionsToTest: ["How do subcontractor identities and records travel across projects?", "Which 16 modules are native and included?", "What offline behavior exists for field workflows?", "How does HammerTech Intelligence cite the observations behind a signal?", "What environmental-compliance workflows exist beyond construction safety?"],
    sources: [
      { label: "HammerTech platform", url: "https://www.hammertech.com/en-us/product/platform", tier: "Primary", purpose: "Construction platform and module baseline", observedAt, caveat: "Company statement." },
      { label: "HammerTech customers", url: "https://www.hammertech.com/en-us/customers", tier: "Vendor proof", purpose: "Named customer footprint", observedAt, caveat: "Company-selected customer directory." },
      { label: "Holder AI story", url: "https://www.hammertech.com/en-us/blog/how-holder-construction-improved-safety-observations-with-ai", tier: "Vendor proof", purpose: "AI workflow and customer example", observedAt, caveat: "Vendor-selected story." },
    ],
  },
  salus: {
    competitorId: "salus",
    researchStatus: "Research pass complete",
    domains: ["Core EHS", "Safety & Training", "Contractor Management", "Construction Safety", "Chemical & SDS", "AI"],
    industries: ["Trade contracting", "General contracting", "Electrical", "Mechanical", "Heavy civil", "Structural steel"],
    headquarters: "Vancouver, British Columbia; US office in Seattle",
    founded: "2017",
    marketTier: "Construction SMB to enterprise",
    buyingMotion: "Crew-first operational safety platform with AI-generated, source-linked construction records",
    whyTheyWin: [
      { claim: "Field adoption is the center of the product and go-to-market narrative.", basis: "SALUS emphasizes QR access, multilingual workflows, offline capture and worker-specific controls for construction crews.", sourceUrl: "https://www.salussafety.io/us/construction-safety-management-software" },
      { claim: "Rosie creates a differentiated AI and evidence story for construction operations.", basis: "Rosie is positioned across content creation, field capture, monitoring and source-linked proof with permission and human approval controls.", sourceUrl: "https://www.salussafety.io/us/" },
      { claim: "The platform connects safety records to operational and commercial proof.", basis: "Published use cases include OSHA packets, insurance readiness, delay evidence, owner reporting and prequalification support.", sourceUrl: "https://www.salussafety.io/us/" },
    ],
    pressurePoints: [
      { signal: "The strongest public differentiation is construction-specific; horizontal enterprise EHS breadth requires separate validation.", boundary: "Category scope, not a verified weakness." },
      { signal: "Large public scale and ROI figures are company statements.", boundary: "Retain the source and validate definitions before board or sales use." },
      { signal: "Rosie outputs require diligence on source coverage, permissions, audit history and human approval.", boundary: "Governance question, not an assertion of failure." },
    ],
    ai: { label: "Rosie", summary: "An AI admin and risk assistant working across connected construction field records with source links and human approval.", capabilities: ["Control and form creation", "Voice and photo structuring", "Multilingual capture", "Readiness and risk monitoring", "Source-linked reports and claim evidence"], sourceUrl: "https://www.salussafety.io/us/" },
    customerProof: [
      { customer: "Willmeng Construction", industry: "General contracting", outcome: "Vendor case study states the company won multiple jobs using live safety proof and eliminated duplicate entry through a Procore integration.", sourceUrl: "https://www.salussafety.io/us/customers/willmeng", caveat: "Vendor-published customer statement; commercial attribution requires validation." },
      { customer: "LMS Reinforcing Steel Group", industry: "Structural steel", outcome: "SALUS states that digitized processing avoided an estimated $180,000 per year in administrative salaries.", sourceUrl: "https://www.salussafety.io/us/pricing", caveat: "Vendor-published estimate; inspect assumptions before comparative use." },
    ],
    reviewSignals: [
      { platform: "G2", score: "4.7 / 5", sample: "49 reviews stated by vendor, verified July 2026", themes: ["Crew adoption", "Field usability", "Construction workflows"], sourceUrl: "https://www.salussafety.io/us/pricing", caveat: "Rating and sample are reproduced on the vendor site; confirm directly on G2 before external use." },
    ],
    activity: [
      { date: "2026", type: "Positioning", title: "Operational safety powered by Rosie", summary: "Current website messaging centers source-linked AI, crew intelligence and business-defense use cases.", sourceUrl: "https://www.salussafety.io/us/" },
    ],
    questionsToTest: ["Which Rosie outputs cite every underlying record?", "How are permissions and human approvals enforced?", "How does one worker identity work across contractors and projects?", "Which workflows remain available offline?", "How does pricing scale by worker, project and module?"],
    sources: [
      { label: "SALUS platform", url: "https://www.salussafety.io/us/", tier: "Primary", purpose: "Positioning, AI, workflow and public scale claims", observedAt, caveat: "Company statement." },
      { label: "Construction safety management", url: "https://www.salussafety.io/us/construction-safety-management-software", tier: "Primary", purpose: "Detailed workflow and integration map", observedAt, caveat: "Company statement." },
      { label: "Willmeng case study", url: "https://www.salussafety.io/us/customers/willmeng", tier: "Vendor proof", purpose: "Named deployment and outcomes", observedAt, caveat: "Vendor-selected customer story." },
    ],
  },
  donesafe: {
    competitorId: "donesafe",
    researchStatus: "Research pass complete",
    domains: ["Core EHS", "Safety & Training", "Sustainability", "Contractor Management", "Chemical & SDS", "Operational Risk", "AI"],
    industries: ["Retail & hospitality", "Manufacturing", "Construction", "Transportation", "Healthcare", "Complex multi-site operations"],
    headquarters: "Sydney, Australia; part of HSI",
    founded: "2012",
    marketTier: "Mid-market to enterprise",
    buyingMotion: "Highly configurable modular EHSQ platform within HSI's broader safety, compliance and learning portfolio",
    whyTheyWin: [
      { claim: "A large configurable module catalog supports many EHSQ and ESG workflows.", basis: "Donesafe states that the platform contains more than 60 configurable modules on one shared interface.", sourceUrl: "https://www.donesafe.com/ehs-platform/why-donesafe/" },
      { claim: "Usability and adaptable configuration are central to the market narrative.", basis: "Current messaging emphasizes everyday-user configuration, modular deployment and interoperability rather than fixed workflows.", sourceUrl: "https://www.donesafe.com/ehs-platform/why-donesafe/" },
      { claim: "HSI brings safety content and regulatory knowledge into the AI story.", basis: "Sky and Image Hazard Recognition are positioned around HSI training content, customer records and regulatory knowledge.", sourceUrl: "https://www.donesafe.com/blog/company/introducing-hsi-sky/" },
    ],
    pressurePoints: [
      { signal: "Donesafe and HSI overlap in the public portfolio, so buyers should validate product roadmap, migration and shared-platform boundaries.", boundary: "Architecture diligence hypothesis based on current brand structure." },
      { signal: "A 60-plus-module catalog makes package, maturity and administrator-effort diligence essential.", boundary: "Buying diligence hypothesis." },
      { signal: "Company-published scale and customer outcomes require definition checks.", boundary: "Use as vendor evidence, not independent market fact." },
    ],
    ai: { label: "HSI Intelligence + Sky", summary: "A platform-wide assistant and specialized AI capabilities connected to EHS data, learning content and regulatory knowledge.", capabilities: ["Context-aware EHS questions", "Risk-trend identification", "Training recommendations", "Image hazard recognition", "Corrective-action drafting"], sourceUrl: "https://www.donesafe.com/blog/company/introducing-hsi-sky/" },
    customerProof: [
      { customer: "McDonald's", industry: "Retail & hospitality", outcome: "Vendor case study reports 95% employee acceptance and a 500% increase in safety participation across its described rollout.", sourceUrl: "https://www.donesafe.com/ehs-platform/why-donesafe/", caveat: "Vendor-published customer outcome; definitions and cohort require validation." },
    ],
    reviewSignals: [],
    activity: [
      { date: "2026-01-29", type: "AI launch", title: "HSI Sky introduced", summary: "HSI announced a context-aware assistant spanning platform data, training content and regulatory knowledge.", sourceUrl: "https://www.donesafe.com/blog/company/introducing-hsi-sky/" },
      { date: "2025", type: "AI launch", title: "Image Hazard Recognition launched", summary: "HSI announced photo-based hazard detection, related OSHA references and recommended corrective actions.", sourceUrl: "https://www.donesafe.com/blog/company/hsi-launches-ai-powered-image-hazard-recognition-to-transform-workplace-safety/" },
    ],
    questionsToTest: ["What is the roadmap relationship between Donesafe and the HSI platform?", "Which 60-plus modules share one data and permissions model?", "Which Sky capabilities are available inside Donesafe today?", "How are AI answers source-linked and audited?", "What can customers configure without professional services?"],
    sources: [
      { label: "Why Donesafe", url: "https://www.donesafe.com/ehs-platform/why-donesafe/", tier: "Primary", purpose: "Platform, module, scale and customer-proof baseline", observedAt, caveat: "Company statement and vendor-selected proof." },
      { label: "HSI Sky announcement", url: "https://www.donesafe.com/blog/company/introducing-hsi-sky/", tier: "Primary", purpose: "Current AI assistant and source model", observedAt, caveat: "Company announcement; rollout varies." },
      { label: "Donesafe module brochure", url: "https://www.donesafe.com/partners/wp-content/uploads/2024/11/HSI-Donesafe-platform-brochure.pdf", tier: "Primary", purpose: "Detailed module map", observedAt, caveat: "Company brochure." },
    ],
  },
  enablon: {
    competitorId: "enablon",
    researchStatus: "Research pass complete",
    domains: ["Core EHS", "Sustainability", "Contractor Management", "Chemical & SDS", "Operational Risk", "AI"],
    industries: ["Oil & gas", "Chemicals", "Manufacturing", "Utilities", "Data centers", "Agriculture", "Financial services"],
    headquarters: "Wolters Kluwer division; global enterprise operations",
    marketTier: "Global enterprise",
    buyingMotion: "Integrated EHSQ, sustainability, control-of-work and operational-risk platform for complex global organizations",
    whyTheyWin: [
      { claim: "Enterprise breadth connects EHSQ, sustainability and operational risk in one platform narrative.", basis: "The Vision Platform combines risk and compliance, engineering and operations, and EHSQ and sustainability.", sourceUrl: "https://www.wolterskluwer.com/en/solutions/enablon/vision-platform" },
      { claim: "Deep process-safety and control-of-work coverage is visible in current investment.", basis: "Enablon launched a cloud-native PHA application integrating hazard assessment, barrier monitoring, bowties and control of work.", sourceUrl: "https://www.wolterskluwer.com/en/news/wolters-kluwer-enablon-launches-new-process-hazard-analysis-application-that-drives-integrated-proce" },
      { claim: "Strong global customer proof exists across industrial and infrastructure settings.", basis: "Current case studies include Syngenta, Yara, SoCalGas, Suncor and a global data-center use case.", sourceUrl: "https://www.wolterskluwer.com/en/solutions/enablon/case-studies" },
    ],
    pressurePoints: [
      { signal: "Enterprise scope and configurability make implementation, administration and module packaging essential diligence.", boundary: "Buying-risk hypothesis; not a universal customer outcome." },
      { signal: "The EHS Companion is an assistance layer; buyers should separate navigation help from analytical or generative capability.", boundary: "Validate each AI use case in product." },
      { signal: "Public pricing is unavailable.", boundary: "Requires current quote evidence." },
    ],
    ai: { label: "Enablon EHS Companion", summary: "AI-assisted navigation and guidance inside the Vision Platform, alongside cloud analytics and operational-risk applications.", capabilities: ["In-product navigation", "Onboarding guidance", "Workflow assistance", "Connected analytics", "Risk and control context"], sourceUrl: "https://www.wolterskluwer.com/en/solutions/enablon/vision-platform" },
    customerProof: [
      { customer: "Lendlease", industry: "Construction and property", outcome: "Enablon states that a mobile-friendly rollout increased observations by 408% and saved more than 7,000 hours annually.", sourceUrl: "https://www.wolterskluwer.com/en/solutions/enablon?id=13&tabid=216", caveat: "Vendor-published customer outcome; validate scope and baseline." },
      { customer: "Yara", industry: "Chemicals and agriculture", outcome: "Vendor case study describes digital permit-to-work improvements in safety, communication, automation and efficiency.", sourceUrl: "https://www.wolterskluwer.com/en/solutions/enablon/case-studies", caveat: "Vendor-selected case study." },
    ],
    reviewSignals: [],
    activity: [
      { date: "2025-10-14", type: "Product launch", title: "Cloud-native Process Hazard Analysis launched", summary: "Enablon expanded process-safety management with integrated barrier monitoring, bowties and control of work.", sourceUrl: "https://www.wolterskluwer.com/en/news/wolters-kluwer-enablon-launches-new-process-hazard-analysis-application-that-drives-integrated-proce" },
      { date: "2026", type: "Vertical campaign", title: "Data-center EHS solution published", summary: "Current positioning addresses permitting, emissions, contractors, LOTO, fuel storage and hyperscale operations.", sourceUrl: "https://www.wolterskluwer.com/en/solutions/enablon/solutions-for-data-centers" },
    ],
    questionsToTest: ["Which modules are cloud-native versus legacy architecture?", "How much administrator and service effort is required?", "Which AI functions go beyond guided navigation?", "How do process-safety and EHS records share controls?", "What mobile workflows operate offline?"],
    sources: [
      { label: "Enablon Vision Platform", url: "https://www.wolterskluwer.com/en/solutions/enablon/vision-platform", tier: "Primary", purpose: "Platform architecture, mobile and AI baseline", observedAt, caveat: "Company statement." },
      { label: "Enablon case studies", url: "https://www.wolterskluwer.com/en/solutions/enablon/case-studies", tier: "Vendor proof", purpose: "Named customers, industries and outcomes", observedAt, caveat: "Vendor-selected evidence." },
      { label: "Enablon newsroom", url: "https://www.wolterskluwer.com/en/solutions/enablon/newsroom", tier: "Primary", purpose: "Current product and corporate activity", observedAt, caveat: "Company announcements." },
    ],
  },
  ecoonline: {
    competitorId: "ecoonline",
    researchStatus: "Research pass complete",
    domains: ["Core EHS", "Safety & Training", "Sustainability", "Contractor Management", "Chemical & SDS", "AI"],
    industries: ["Manufacturing", "Chemicals", "Construction", "Healthcare", "Retail", "Energy", "Public sector"],
    headquarters: "Oslo, Norway",
    founded: "2000",
    marketTier: "Mid-market to enterprise",
    buyingMotion: "Frontline-oriented EHS, chemical management and sustainability suite with expanding emergency and lone-worker coverage",
    whyTheyWin: [
      { claim: "Chemical-management heritage provides a distinct entry point into broader EHS.", basis: "EcoOnline combines EHS workflows with chemical approvals, SDS management and AI-assisted SDS extraction.", sourceUrl: "https://www.ecoonline.com/en-us/ehs-software/" },
      { claim: "The product story emphasizes practical connected-worker adoption.", basis: "Current releases combine reporting, training, checklists, lone-worker support and field safety workflows.", sourceUrl: "https://www.ecoonline.com/en-us/news/ecoonline-accelerates-momentum-in-north-america/" },
      { claim: "EcoAI is positioned around safety-specific coaching and agents rather than a general chatbot.", basis: "EcoAssist and EcoAgents are described as grounded in EHS expertise with humans retaining approval.", sourceUrl: "https://www.ecoonline.com/en-us/ai/" },
    ],
    pressurePoints: [
      { signal: "Acquisition-led portfolio expansion makes shared data, identity and user-experience proof important.", boundary: "Architecture diligence hypothesis." },
      { signal: "AI grounding and jurisdiction coverage require workflow-level evidence.", boundary: "Company statement until demonstrated." },
      { signal: "Public pricing is unavailable.", boundary: "Requires current quote evidence." },
    ],
    ai: { label: "EcoAI", summary: "EcoAssist coaching and EcoAgents workflow automation embedded in EcoOnline's EHS and chemical-management suite.", capabilities: ["In-workflow coaching", "Safety workflow agents", "Checklist generation", "Quiz generation", "SDS smart extraction", "Human sign-off"], sourceUrl: "https://www.ecoonline.com/en-us/ai/" },
    customerProof: [],
    reviewSignals: [],
    activity: [
      { date: "2025", type: "Acquisition", title: "D4H acquisition expanded crisis readiness", summary: "EcoOnline connected emergency and crisis-management capability to its broader safety suite.", sourceUrl: "https://www.ecoonline.com/en-us/news/ecoonline-accelerates-momentum-in-north-america/" },
      { date: "2025", type: "Product expansion", title: "North American innovation portfolio expanded", summary: "The company highlighted AI checklist and quiz generation, training, satellite lone-worker support, SDS extraction and climate-risk analytics.", sourceUrl: "https://www.ecoonline.com/en-us/news/ecoonline-accelerates-momentum-in-north-america/" },
    ],
    questionsToTest: ["Which acquired products share one login and data model?", "How does EcoAI cite regulatory or customer sources?", "Which chemical datasets are proprietary or licensed?", "How does offline field use vary by module?", "Which sustainability workflows are native?"],
    sources: [
      { label: "EcoOnline EHS software", url: "https://www.ecoonline.com/en-us/ehs-software/", tier: "Primary", purpose: "Platform and module baseline", observedAt, caveat: "Company statement." },
      { label: "EcoAI", url: "https://www.ecoonline.com/en-us/ai/", tier: "Primary", purpose: "AI products, grounding and governance", observedAt, caveat: "Company statement; validate availability." },
      { label: "North America momentum", url: "https://www.ecoonline.com/en-us/news/ecoonline-accelerates-momentum-in-north-america/", tier: "Primary", purpose: "Acquisition and product activity", observedAt, caveat: "Company announcement." },
    ],
  },
  evotix: {
    competitorId: "evotix",
    researchStatus: "Research pass complete",
    domains: ["Core EHS", "Safety & Training", "Sustainability", "Contractor Management", "Chemical & SDS", "Operational Risk", "Construction Safety", "AI"],
    industries: ["Manufacturing", "Mining", "Energy & utilities", "Construction", "Warehousing", "Transportation", "Retail", "Oil & gas", "Food & beverage"],
    headquarters: "Chicago, Illinois and London, United Kingdom",
    marketTier: "Mid-market and enterprise",
    buyingMotion: "Configurable EHS and sustainability platform offered in professional and enterprise editions",
    whyTheyWin: [
      { claim: "Broad EHS and ESG coverage is paired with separate mid-market and enterprise motions.", basis: "Evotix markets standardized Professional and configurable Enterprise offers across safety, compliance, operational risk and sustainability.", sourceUrl: "https://www.evotix.com/" },
      { claim: "EvoAI is presented as a platform layer usable in any workflow.", basis: "Evotix describes configurable prompts, role controls, RAG, document and image extraction, and web/mobile assistance.", sourceUrl: "https://www.evotix.com/ai-in-ehs/ai-in-evitox" },
      { claim: "Current messaging emphasizes connected workflows and self-configuration.", basis: "The platform describes incident-to-risk, audit-to-action and training-to-hazard connections without heavy custom development.", sourceUrl: "https://www.evotix.com/platform" },
    ],
    pressurePoints: [
      { signal: "Buyers should verify differences between Professional and Enterprise packaging, depth and migration paths.", boundary: "Packaging diligence hypothesis." },
      { signal: "The AI vision is broad; production availability needs use-case-level proof.", boundary: "Company statement until demonstrated." },
      { signal: "Company-published reduction and ROI figures require named baselines.", boundary: "Vendor evidence, not independent attribution." },
    ],
    ai: { label: "EvoAI", summary: "Configurable AI embedded across Evotix 360 workflows with RAG, role controls and human oversight.", capabilities: ["Workflow copilot", "Document and image extraction", "Incident classification", "SIF flagging", "Corrective-action suggestions", "Audit trails"], sourceUrl: "https://www.evotix.com/ai-in-ehs/ai-in-evitox" },
    customerProof: [
      { customer: "Published customer cohort", industry: "Multi-industry", outcome: "Evotix publishes a customer statement reporting an 86% reduction in total recordable injury rate and incident close-out improvement from 59% to 98%.", sourceUrl: "https://www.evotix.com/", caveat: "The homepage excerpt does not identify the customer or baseline period; do not use externally without the full case study." },
    ],
    reviewSignals: [],
    activity: [
      { date: "2026", type: "AI partnership", title: "Safety Radar partnership announced", summary: "Evotix announced a partnership focused on AI risk intelligence and SIF prevention.", sourceUrl: "https://www.evotix.com/resources/news-and-press" },
      { date: "2024-06-25", type: "Product launch", title: "AI and module enhancements introduced", summary: "Evotix announced AI Suggestion Assistant, journey planning and advanced chemical management updates.", sourceUrl: "https://www.evotix.com/news-and-press/evotix-introduces-new-ai-capabilities-to-boost-enterprise-performance" },
    ],
    questionsToTest: ["Which EvoAI functions are generally available today?", "How do Professional and Enterprise differ by module?", "What data sources can customer admins govern for RAG?", "How complete are AI audit trails and human approvals?", "What configuration requires services?"],
    sources: [
      { label: "Evotix platform", url: "https://www.evotix.com/platform", tier: "Primary", purpose: "Architecture, workflow and configuration baseline", observedAt, caveat: "Company statement." },
      { label: "AI at Evotix", url: "https://www.evotix.com/ai-in-ehs/ai-in-evitox", tier: "Primary", purpose: "AI architecture and governance", observedAt, caveat: "Company statement; availability requires validation." },
      { label: "Evotix news and press", url: "https://www.evotix.com/resources/news-and-press", tier: "Primary", purpose: "Current activity monitoring", observedAt, caveat: "Company and media links." },
    ],
  },
  highwire: {
    competitorId: "highwire",
    researchStatus: "Research pass complete",
    domains: ["Core EHS", "Contractor Management", "Operational Risk", "Construction Safety", "AI"],
    industries: ["Construction", "Data centers", "Life sciences", "Manufacturing", "Semiconductors", "Renewable energy", "Universities", "Health systems"],
    headquarters: "Burlington, Massachusetts",
    founded: "2008",
    marketTier: "Enterprise owner and general-contractor ecosystems",
    buyingMotion: "Contractor-success and risk network spanning prequalification, safety, finance, insurance and field performance",
    whyTheyWin: [
      { claim: "The value proposition moves beyond pass/fail prequalification toward contractor improvement.", basis: "Highwire's Partner Elevation model combines assessment, collaboration and continuous performance improvement.", sourceUrl: "https://www.highwire.com/" },
      { claim: "Strong customer proof exists in data centers, semiconductors, construction and life sciences.", basis: "Current stories include Google, Skanska, Rosendin, NTT, T5, pharmaceutical and semiconductor manufacturers.", sourceUrl: "https://www.highwire.com/customer-stories" },
      { claim: "AI analyzes contractor safety documentation and leading indicators.", basis: "Highwire's safety risk analytics grade program depth and surface discrepancies or positive findings from submitted documentation.", sourceUrl: "https://help.highwire.com/hc/en-us/articles/29349707466900-What-are-safety-risk-analytics" },
    ],
    pressurePoints: [
      { signal: "Highwire is contractor-risk infrastructure rather than a full horizontal EHS system.", boundary: "Category boundary, not a verified weakness." },
      { signal: "Network and enrollment economics should be evaluated for both hiring clients and contractors.", boundary: "Requires current pricing and contract evidence." },
      { signal: "AI-generated contractor findings need transparency, correction and appeal diligence.", boundary: "Governance question, not an assertion of model error." },
    ],
    ai: { label: "Safety risk analytics", summary: "Azure-based AI analysis of contractor safety programs and documents, combined with Highwire's safety metrics.", capabilities: ["Document validation", "Leading-indicator grading", "Risk discrepancies", "Positive findings", "Contractor risk overview"], sourceUrl: "https://help.highwire.com/hc/en-us/articles/29349707466900-What-are-safety-risk-analytics" },
    customerProof: [
      { customer: "Rosendin", industry: "Electrical construction", outcome: "Vendor case study reports 100x contractor-spend growth, 50% lower TRIR, 65% lower DART and insurance savings.", sourceUrl: "https://www.highwire.com/rosendin-case-study", caveat: "Vendor-published; multiple operational and insurance factors contributed." },
      { customer: "Global semiconductor manufacturer", industry: "Semiconductors", outcome: "Vendor case study reports nearly 600% construction growth alongside a 50% recordable-rate reduction and $50 million in insurance savings across more than $10 billion of projects.", sourceUrl: "https://www.highwire.com/semiconductor-case-study", caveat: "Customer is unnamed and outcomes are vendor-published." },
    ],
    reviewSignals: [],
    activity: [
      { date: "2025-10", type: "Corporate activity", title: "Highwire joined Veriforce", summary: "Highwire states that it joined Veriforce to combine construction risk insight with a broader contractor-management network.", sourceUrl: "https://www.highwire.com/our-story" },
      { date: "2024-08", type: "AI rollout", title: "AI safety risk analytics introduced", summary: "Highwire began applying AI-based analysis to newly enrolling contractors, with broader rollout planned for 2025.", sourceUrl: "https://help.highwire.com/hc/en-us/articles/29349707466900-What-are-safety-risk-analytics" },
    ],
    questionsToTest: ["How will Veriforce integration affect product, network and pricing?", "How can contractors inspect or challenge AI findings?", "Which records update continuously after prequalification?", "How are project incidents and inspections tied to enterprise contractor profiles?", "What fees are borne by contractors versus hiring clients?"],
    sources: [
      { label: "Highwire platform", url: "https://www.highwire.com/", tier: "Primary", purpose: "Platform, industries, network and positioning", observedAt, caveat: "Company statement." },
      { label: "Safety risk analytics help", url: "https://help.highwire.com/hc/en-us/articles/29349707466900-What-are-safety-risk-analytics", tier: "Primary", purpose: "AI methods, rollout and security", observedAt, caveat: "Company help-center documentation." },
      { label: "Highwire customer stories", url: "https://www.highwire.com/customer-stories", tier: "Vendor proof", purpose: "Named and anonymous outcome evidence", observedAt, caveat: "Vendor-selected evidence." },
    ],
  },
  isnetworld: {
    competitorId: "isnetworld", researchStatus: "Research pass complete",
    domains: ["Core EHS", "Safety & Training", "Sustainability", "Contractor Management", "Operational Risk"],
    industries: ["Oil & gas", "Utilities", "Mining", "Manufacturing", "Chemicals", "Pharmaceuticals", "Food & beverage", "Data centers"],
    headquarters: "Dallas, Texas", founded: "2001", marketTier: "Global enterprise network",
    buyingMotion: "Large contractor and supplier qualification network with managed verification, benchmarking and account services",
    whyTheyWin: [
      { claim: "Network scale and managed verification create a strong enterprise moat.", basis: "ISN states that 900 Hiring Clients manage 90,000 contractors and suppliers across more than 85 countries, with RAVS specialists reviewing submissions.", sourceUrl: "https://www.isnetworld.com/en/hiring-clients" },
      { claim: "Coverage extends beyond HSE into insurance, training, cybersecurity, quality and sustainability.", basis: "ISNetworld centralizes company, project and employee-level qualification requirements and more than 55 tools.", sourceUrl: "https://dt.isnetworld.com/en/contractor-management-software" },
      { claim: "Benchmarking and data-science services support executive contractor-risk programs.", basis: "ISN describes analytics dashboards, annual executive reviews, peer comparisons and leading-indicator predictive modeling.", sourceUrl: "https://www.isnetworld.com/en/hiring-clients" },
    ],
    pressurePoints: [
      { signal: "Contractor enrollment cost and administrative burden should be evaluated on both sides of the network.", boundary: "Requires current contract, pricing and contractor evidence." },
      { signal: "The platform is contractor-risk infrastructure, not a full EHS operating system.", boundary: "Category boundary, not a verified weakness." },
      { signal: "No current public generative-AI product claim was identified in this research pass.", boundary: "Absence of public evidence is not proof of no internal or planned AI capability." },
    ],
    ai: { label: "ISN Analytics and predictive modeling", summary: "Data-science, benchmarking and leading-indicator models are publicly described; no distinct generative-AI assistant was verified.", capabilities: ["Contractor benchmarking", "Leading-indicator models", "Peer comparisons", "Executive analytics", "Personalized recommendations"], sourceUrl: "https://www.isnetworld.com/en/hiring-clients" },
    customerProof: [{ customer: "Astro Pak", industry: "Industrial services", outcome: "ISN states that Astro Pak streamlined processes, expanded its customer base and saw incident rates decline over time.", sourceUrl: "https://www.isnetworld.com/en/publications/isnetworld-case-study-astro-pak", caveat: "Vendor-published summary; detailed measures are gated." }],
    reviewSignals: [],
    activity: [{ date: "2026-07-23", type: "Market expansion", title: "175+ utility, power, renewable and data-center clients", summary: "ISN announced a milestone across fast-growing infrastructure sectors.", sourceUrl: "https://www.isnetworld.com/en" }, { date: "2025", type: "Product experience", title: "UX and accessibility investment highlighted", summary: "ISN described continued usability and accessibility work across Hiring Client and contractor journeys.", sourceUrl: "https://www.isnetworld.com/en/blog/enhancing-user-experience" }],
    questionsToTest: ["What do contractors pay and how often must profiles be maintained?", "How are RAVS decisions corrected or appealed?", "Which leading-indicator models are explainable to clients?", "How does employee-level data integrate with site access?", "Which records can be exported through the API?"],
    sources: [
      { label: "ISNetworld for Hiring Clients", url: "https://www.isnetworld.com/en/hiring-clients", tier: "Primary", purpose: "Scale, services, analytics and integration", observedAt, caveat: "Company statement." },
      { label: "Platform overview", url: "https://dt.isnetworld.com/en/contractor-management-software", tier: "Primary", purpose: "Tool and workflow baseline", observedAt, caveat: "Company statement." },
      { label: "ISN newsroom", url: "https://www.isnetworld.com/en", tier: "Primary", purpose: "Current client and market activity", observedAt, caveat: "Company announcements." },
    ],
  },
  avetta: {
    competitorId: "avetta", researchStatus: "Research pass complete",
    domains: ["Core EHS", "Sustainability", "Contractor Management", "Operational Risk", "AI"],
    industries: ["Oil & energy", "Utilities", "Mining", "Construction", "Telecommunications", "Manufacturing", "Transportation", "Food & beverage"],
    headquarters: "Lehi, Utah and Houston, Texas", marketTier: "Global enterprise network",
    buyingMotion: "Supply-chain and contractor work-readiness network spanning prequalification, workers, site access, safety, insurance, ESG and financial risk",
    whyTheyWin: [
      { claim: "Global network scale supports contractor reuse and multinational programs.", basis: "Avetta states that its network supports more than 130,000 contractors and suppliers across 120+ countries and 36+ languages.", sourceUrl: "https://www.avetta.com/suppliers-contractors" },
      { claim: "Avetta One covers contractor risk from prequalification through site access and ongoing performance.", basis: "Current client positioning spans compliance, worker management, insurance, ESG, analytics and operational monitoring.", sourceUrl: "https://www.avetta.com/clients" },
      { claim: "AskAva connects proprietary risk data to pre-work hazard and control recommendations.", basis: "Avetta describes generative AI support for SWMS and dynamic risk-assessment recommendations in high-risk work.", sourceUrl: "https://www.avetta.com/company-news/avetta-unveils-advanced-safety-ai-and-esg-features-to-the-avetta-one-platform" },
    ],
    pressurePoints: [
      { signal: "Supplier pricing and enrollment friction should be measured alongside Hiring Client value.", boundary: "Requires current quote and contractor cohort evidence." },
      { signal: "A broad acquisition and regional-product footprint makes platform consistency important.", boundary: "Architecture diligence hypothesis." },
      { signal: "Vendor network outcome statistics require definition and cohort checks.", boundary: "Company-calculated evidence." },
    ],
    ai: { label: "AskAva", summary: "Generative risk assistance using job context and Avetta data to suggest hazards and controls before high-risk work.", capabilities: ["SWMS support", "Hazard identification", "Control recommendations", "Supplier analytics", "Work-readiness signals"], sourceUrl: "https://www.avetta.com/company-news/avetta-unveils-advanced-safety-ai-and-esg-features-to-the-avetta-one-platform" },
    customerProof: [{ customer: "Transgrid", industry: "Power transmission", outcome: "Avetta states that Transgrid tripled its external workforce, digitized prequalification and saved tens of thousands of onboarding hours while scaling to 10,000 users.", sourceUrl: "https://www.avetta.com/en-gb/customers/how-transgrid-is-leading-the-transition-to-a-clean-energy-future-while-tripling-its-external-workforce-reducing-trifr-and-gaining-real-time-insights", caveat: "Vendor-published; broader safety leadership and process changes contributed." }, { customer: "Encino Energy", industry: "Oil & gas", outcome: "Vendor case study describes real-time contractor readiness, worker compliance and field access across a changing supplier workforce.", sourceUrl: "https://www.avetta.com/testimonial/encino-energy-optimizes-digital-solutions-for-contractor-management", caveat: "Vendor-selected case study." }],
    reviewSignals: [],
    activity: [{ date: "2026-03-18", type: "Product launch", title: "Visitor Management launched", summary: "Avetta extended worker and site-access governance to non-employee visitors.", sourceUrl: "https://www.avetta.com/company-news/avetta-helps-reduce-site-access-risks-through-expanded-visibility" }, { date: "2024-07-24", type: "AI expansion", title: "AskAva, safety and ESG features expanded", summary: "Avetta announced AI risk recommendations, subcontractor management and ESG updates.", sourceUrl: "https://www.avetta.com/company-news/avetta-unveils-advanced-safety-ai-and-esg-features-to-the-avetta-one-platform" }],
    questionsToTest: ["How does pricing split between client and supplier?", "Which regional products share one Avetta One data model?", "How are AskAva recommendations sourced and audited?", "Which worker and visitor workflows operate offline?", "How are supplier disputes and data corrections handled?"],
    sources: [
      { label: "Avetta client platform", url: "https://www.avetta.com/clients", tier: "Primary", purpose: "Platform and outcome baseline", observedAt, caveat: "Company statement." },
      { label: "Avetta customers", url: "https://www.avetta.com/customers", tier: "Vendor proof", purpose: "Cross-industry customer evidence", observedAt, caveat: "Vendor-selected stories." },
      { label: "AskAva announcement", url: "https://www.avetta.com/company-news/avetta-unveils-advanced-safety-ai-and-esg-features-to-the-avetta-one-platform", tier: "Primary", purpose: "AI and product activity", observedAt, caveat: "Company announcement." },
    ],
  },
  safetyculture: {
    competitorId: "safetyculture", researchStatus: "Research pass complete",
    domains: ["Core EHS", "Safety & Training", "Contractor Management", "Operational Risk", "Construction Safety", "AI"],
    industries: ["Manufacturing", "Construction", "Food & hospitality", "Retail", "Transportation", "Oil & gas", "Facilities", "Aviation"],
    headquarters: "Sydney, Australia", founded: "2004", marketTier: "SMB to global enterprise",
    buyingMotion: "Product-led workplace-operations platform expanding from inspections into training, assets, contractors, sensors, issues and AI",
    whyTheyWin: [
      { claim: "Low-friction frontline adoption and a freemium entry point create broad reach.", basis: "SafetyCulture evolved from iAuditor and states that more than two million workers use the platform in 180+ countries.", sourceUrl: "https://safetyculture.com/newsroom" },
      { claim: "The platform has expanded well beyond inspections.", basis: "Current coverage includes issues, tasks, assets, sensors, training, lone worker, contractors, communications and document management.", sourceUrl: "https://safetyculture.com/platform" },
      { claim: "AI is applied to creation, reporting, issue capture, contractor documents and operational questions.", basis: "Current help documentation lists assistant, template, report, training, issue, contractor and schedule features with permission-aware controls.", sourceUrl: "https://help.safetyculture.com/003943" },
    ],
    pressurePoints: [
      { signal: "Buyers should distinguish frontline operations breadth from deep regulatory, occupational-health and environmental workflow depth.", boundary: "Category diligence, not a verified weakness." },
      { signal: "AI usage is credit-metered and may vary by plan and seat.", boundary: "Current help-center evidence; validate commercial terms." },
      { signal: "Template flexibility does not by itself prove enterprise EHS governance.", boundary: "Workflow diligence hypothesis." },
    ],
    ai: { label: "SafetyCulture AI", summary: "An operational intelligence layer across frontline records, content creation, issue capture, reporting and contractor documents.", capabilities: ["Conversational assistant", "Photo and voice issue creation", "Document-to-template", "Report summaries", "Training creation and translation", "Site benchmarking"], sourceUrl: "https://safetyculture.com/ai" },
    customerProof: [{ customer: "Schneider Electric", industry: "Energy management and manufacturing", outcome: "Vendor case study reports an 80% reduction in audit time and approximately 60 labor hours saved per week across 30 auditors.", sourceUrl: "https://safetyculture.com/customers/schneider-electric/", caveat: "Vendor-published customer outcome." }, { customer: "BOS Solutions", industry: "Oil & gas services", outcome: "Vendor case study reports a 56% TRIR reduction and $80,000 workers-compensation saving alongside standardized digital inspections.", sourceUrl: "https://safetyculture.com/customers/bos-solutions", caveat: "Vendor-published; cultural and program changes also contributed." }],
    reviewSignals: [],
    activity: [{ date: "2026-08-05", type: "AI product", title: "AI Assistant documented across web and mobile", summary: "SafetyCulture described a permission-aware conversational interface with plan-based AI credits.", sourceUrl: "https://help.safetyculture.com/005770" }, { date: "2024-09-09", type: "Funding", title: "$165 million round announced", summary: "SafetyCulture announced funding for global expansion and frontline AI innovation.", sourceUrl: "https://safetyculture.com/newsroom" }],
    questionsToTest: ["Which AI features are available by plan and credit allocation?", "How deep are contractor qualification and environmental workflows?", "Which capabilities operate offline?", "How are templates governed across global sites?", "What enterprise controls separate lite and full seats?"],
    sources: [
      { label: "SafetyCulture platform", url: "https://safetyculture.com/platform", tier: "Primary", purpose: "Current product and workflow map", observedAt, caveat: "Company statement." },
      { label: "SafetyCulture AI", url: "https://safetyculture.com/ai", tier: "Primary", purpose: "AI capabilities and positioning", observedAt, caveat: "Company statement." },
      { label: "AI help center", url: "https://help.safetyculture.com/003943", tier: "Primary", purpose: "Availability, controls and subprocessors", observedAt, caveat: "Company documentation; packaging changes over time." },
    ],
  },
  "origami-risk": {
    competitorId: "origami-risk", researchStatus: "Research pass complete",
    domains: ["Core EHS", "Chemical & SDS", "Operational Risk", "AI"],
    industries: ["Manufacturing", "Construction", "Healthcare", "Public sector", "Transportation", "Insurance", "Retail"],
    headquarters: "Chicago, Illinois", founded: "2009", marketTier: "Enterprise",
    buyingMotion: "Integrated risk and safety platform connecting RMIS, claims, GRC, EHS and financial outcomes",
    whyTheyWin: [
      { claim: "Claims, insurance and EHS live in one risk architecture.", basis: "Origami positions a single cloud-native platform spanning RMIS, EHS, GRC, claims and exposure data.", sourceUrl: "https://www.origamirisk.com/wp-content/uploads/2026/06/OrigamiRisk_SolutionSheet_IRM_Integrated-Risk-Safety-Solutions_WEB_20260605.pdf" },
      { claim: "The value story links safety activity directly to total cost of risk.", basis: "Current materials emphasize financial risk, claims outcomes and TCOR analytics alongside EHS workflows.", sourceUrl: "https://www.origamirisk.com/wp-content/uploads/2026/04/OrigamiRisk_SellSheet_Brochure_IRM_20260427-3.pdf" },
      { claim: "Current AI is positioned across risk, claims, EHS and GRC rather than one isolated module.", basis: "Origami Risk AI is described as a platform capability spanning multiple risk domains.", sourceUrl: "https://www.origamirisk.com/wp-content/uploads/2026/01/OrigamiRisk_SolutionsSheet_Origami-Risk-AI_20260406.pdf" },
    ],
    pressurePoints: [{ signal: "EHS buyers should validate specialist depth relative to claims and RMIS heritage.", boundary: "Category diligence hypothesis." }, { signal: "AI capability and packaging require workflow-level proof.", boundary: "Company statement until demonstrated." }, { signal: "Public pricing is unavailable.", boundary: "Requires current quote evidence." }],
    ai: { label: "Origami Risk AI", summary: "Embedded AI across integrated risk, safety, claims, exposure and governance data.", capabilities: ["Risk summaries", "Claims intelligence", "EHS insights", "Document assistance", "TCOR analytics"], sourceUrl: "https://www.origamirisk.com/wp-content/uploads/2026/01/OrigamiRisk_SolutionsSheet_Origami-Risk-AI_20260406.pdf" },
    customerProof: [{ customer: "Boise Cascade", industry: "Building materials manufacturing", outcome: "Vendor case study describes consolidating EHS and RMIS data on one platform to improve transparency and reporting.", sourceUrl: "https://www.origamirisk.com/wp-content/uploads/2024/09/OrigamiRisk_CaseStudy_Boise_20251124.pdf", caveat: "Vendor-published case study." }],
    reviewSignals: [], activity: [{ date: "2026", type: "Platform", title: "Integrated Risk & Safety positioning expanded", summary: "Current materials unify RMIS, EHS and GRC with embedded AI and financial-risk context.", sourceUrl: "https://www.origamirisk.com/wp-content/uploads/2026/06/OrigamiRisk_SolutionSheet_IRM_Integrated-Risk-Safety-Solutions_WEB_20260605.pdf" }],
    questionsToTest: ["How deep are environmental and occupational-health workflows?", "Which claims and EHS objects share one data model?", "What AI outputs are source-linked and reviewable?", "How does implementation differ for RMIS-led versus EHS-led buyers?", "Which mobile workflows operate offline?"],
    sources: [{ label: "Integrated Risk & Safety", url: "https://www.origamirisk.com/wp-content/uploads/2026/06/OrigamiRisk_SolutionSheet_IRM_Integrated-Risk-Safety-Solutions_WEB_20260605.pdf", tier: "Primary", purpose: "Platform and integration baseline", observedAt, caveat: "Company solution sheet." }, { label: "Origami Risk AI", url: "https://www.origamirisk.com/wp-content/uploads/2026/01/OrigamiRisk_SolutionsSheet_Origami-Risk-AI_20260406.pdf", tier: "Primary", purpose: "AI capability baseline", observedAt, caveat: "Company solution sheet." }, { label: "Boise Cascade case study", url: "https://www.origamirisk.com/wp-content/uploads/2024/09/OrigamiRisk_CaseStudy_Boise_20251124.pdf", tier: "Vendor proof", purpose: "Named customer evidence", observedAt, caveat: "Vendor-selected story." }],
  },
  quentic: {
    competitorId: "quentic", researchStatus: "Research pass complete",
    domains: ["Core EHS", "Safety & Training", "Sustainability", "Chemical & SDS", "Operational Risk", "AI"],
    industries: ["Manufacturing", "Energy", "Logistics", "Construction", "Services", "Public sector"],
    headquarters: "Berlin, Germany; an AMCS company", founded: "2007", marketTier: "Mid-market to enterprise, especially EMEA",
    buyingMotion: "Modular EHS and sustainability SaaS with European compliance, expert content and expanding governed AI",
    whyTheyWin: [{ claim: "EHS and sustainability are presented as one modular system.", basis: "Quentic combines health and safety, chemicals, incidents, instructions, environment, legal compliance, control of work and sustainability.", sourceUrl: "https://www.quentic.com/software/" }, { claim: "European compliance and governance are central to the AI narrative.", basis: "Quentic documents Azure AI, EU AI Act controls, transparency notes, customer-data restrictions and human oversight.", sourceUrl: "https://www.quentic.com/software/ehs-ai/" }, { claim: "AI use cases are concrete and EHS-specific.", basis: "Current features include Quentin, report assistance, SDS extraction, translations, question generation and root-cause support.", sourceUrl: "https://www.quentic.com/software/ehs-ai/" }],
    pressurePoints: [{ signal: "North American regulatory content, services and market presence require target-account validation.", boundary: "Geographic diligence hypothesis." }, { signal: "AI functionality is modular and may require separate entitlements.", boundary: "Company packaging statement; confirm commercial scope." }, { signal: "AMCS and FigBytes integration should be validated by workflow.", boundary: "Architecture diligence hypothesis." }],
    ai: { label: "Quentin + Quentic AI", summary: "Governed EHS and sustainability assistance using Azure AI, with human oversight and centralized controls.", capabilities: ["Company-data assistant", "SDS extraction", "Photo, video and voice reporting", "Question generation", "Translation", "5-why analysis"], sourceUrl: "https://www.quentic.com/software/ehs-ai/" },
    customerProof: [{ customer: "Kärcher", industry: "Manufacturing", outcome: "Quentic publishes customer testimony about global standardization and environmental transparency.", sourceUrl: "https://www.quentic.com/software/", caveat: "Vendor-published testimonial without quantified outcome." }],
    reviewSignals: [], activity: [{ date: "2026-01-22", type: "AI expansion", title: "Expanded EHS AI capabilities announced", summary: "Quentic announced a 2026 roadmap for field reporting, analysis and administrative automation.", sourceUrl: "https://www.quentic.com/news/dv/80004248-quentic-announces-expanded-ai-capabilities-to-support-safer-smarter-ehs-operations/" }, { date: "2023", type: "Portfolio integration", title: "FigBytes sustainability capabilities brought into Quentic", summary: "AMCS combined FigBytes ESG reporting with Quentic safety and compliance.", sourceUrl: "https://www.quentic.com/news/dv/80004264-figbytes-now-quentic-receives-gri-certification/" }],
    questionsToTest: ["Which AI features are included by module?", "How complete is North American legal content?", "How are FigBytes sustainability workflows integrated?", "Which mobile functions operate offline?", "How can admins inspect AI inputs and transparency notes?"],
    sources: [{ label: "Quentic software", url: "https://www.quentic.com/software/", tier: "Primary", purpose: "Platform, modules and public scale", observedAt, caveat: "Company statement." }, { label: "Quentic AI", url: "https://www.quentic.com/software/ehs-ai/", tier: "Primary", purpose: "AI capabilities, infrastructure and governance", observedAt, caveat: "Company statement; packaging varies." }, { label: "Quentic news", url: "https://www.quentic.com/news", tier: "Primary", purpose: "Current product and company activity", observedAt, caveat: "Company announcements." }],
  },
  ideagen: {
    competitorId: "ideagen", researchStatus: "Research pass complete",
    domains: ["Core EHS", "Safety & Training", "Sustainability", "Contractor Management", "Chemical & SDS", "Operational Risk", "AI"],
    industries: ["Aerospace & defense", "Life sciences", "Healthcare", "Manufacturing", "Mining", "Construction", "Government", "Aviation"],
    headquarters: "Nottingham, United Kingdom", founded: "1993", marketTier: "Global regulated enterprise",
    buyingMotion: "Acquisition-built quality, risk, audit, compliance and EHS portfolio with deep regulated-industry reach",
    whyTheyWin: [{ claim: "Breadth across quality, audit, risk and EHS opens multiple executive buying centers.", basis: "Ideagen serves highly regulated organizations with a large portfolio and broad installed base.", sourceUrl: "https://www.ideagen.com/solutions" }, { claim: "Rapid acquisitions are adding specialist EHS depth.", basis: "Recent additions include SafetyStratus chemicals, Envirosuite environmental intelligence, Reactec wearables, WorkSafe Guardian lone worker and Beakon.", sourceUrl: "https://www.ideagen.com/company/m-and-a/timeline" }, { claim: "AI is embedded across multiple EHS workflow stages.", basis: "Current company material describes contextual assistance for incident classification and action planning, alongside the Mazlan launch.", sourceUrl: "https://www.ideagen.com/company/news/ideagen-a-leader-in-green-quadrant-ehs-2025" }],
    pressurePoints: [{ signal: "Acquisition breadth makes product overlap, migration and shared architecture the central diligence issue.", boundary: "Architecture hypothesis based on public M&A history." }, { signal: "The portfolio may be sold as several specialized platforms rather than one uniform experience.", boundary: "Validate current packaging and roadmap." }, { signal: "Company scale claims span all Ideagen products, not EHS alone.", boundary: "Do not apply group-wide figures to one EHS product." }],
    ai: { label: "Ideagen AI + Mazlan", summary: "Pervasive contextual assistance across compliance and EHS workflows, supported by acquired specialist data and products.", capabilities: ["Incident classification", "Action-plan support", "Regulatory intelligence", "Predictive environmental modeling", "AI machinery data", "Contextual guidance"], sourceUrl: "https://www.ideagen.com/company/news/ideagen-a-leader-in-green-quadrant-ehs-2025" },
    customerProof: [{ customer: "ScottsMiracle-Gro", industry: "Consumer manufacturing", outcome: "Ideagen reports a 40% recordable-rate reduction, 25% fewer work-related claims and 113% higher investigation completion over the cited periods.", sourceUrl: "https://www.ideagen.com/resources/casestudies/scottsmiracle-gro-smg", caveat: "Vendor-published; outcomes span five years and broader safety-program work." }],
    reviewSignals: [], activity: [{ date: "2025-10-02", type: "Acquisition", title: "SafetyStratus acquired", summary: "Ideagen added chemical inventory, radiation, hazardous waste and biosafety depth.", sourceUrl: "https://www.ideagen.com/company/news/ideagen-acquires-safetystratus-adding-specialized-chemical-management-to-its-ehs-portfolio" }, { date: "2025-08-22", type: "Acquisition", title: "Envirosuite acquisition completed", summary: "Ideagen added real-time environmental monitoring, predictive modeling and community engagement.", sourceUrl: "https://www.ideagen.com/company/news/ideagen-completes-acquisition-of-environmental--intelligence-company-envirosuite" }, { date: "2025-12-02", type: "AI launch", title: "Mazlan launched", summary: "Ideagen announced a new AI layer across its operating portfolio.", sourceUrl: "https://www.ideagen.com/company/news?page=40" }],
    questionsToTest: ["Which acquired EHS products share one identity and data model?", "What is the migration roadmap for ProcessMAP, OSHENS, Beakon and SafetyStratus?", "Which Mazlan features are available inside EHS today?", "How are regulatory-content updates governed?", "Which products are FedRAMP-authorized?"],
    sources: [{ label: "Ideagen solutions", url: "https://www.ideagen.com/solutions", tier: "Primary", purpose: "Portfolio and buying-center baseline", observedAt, caveat: "Company statement." }, { label: "Ideagen M&A timeline", url: "https://www.ideagen.com/company/m-and-a/timeline", tier: "Primary", purpose: "Acquisition and product lineage", observedAt, caveat: "Company history." }, { label: "Ideagen AI in EHS", url: "https://www.ideagen.com/company/news/ideagen-a-leader-in-green-quadrant-ehs-2025", tier: "Primary", purpose: "AI positioning and EHS workflow examples", observedAt, caveat: "Company summary of licensed analyst research." }],
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
