export type CompetitorProfile = {
  id: string;
  name: string;
  platform: string;
  officialUrl: string;
  retrieved: string;
  sourceType: "Official company website";
  reliability: "Company Statement";
  statedPositioning: string;
  modules: string[];
  marketRelevance: string[];
  evidenceStatus: "Official source mapped";
};

export const competitors: CompetitorProfile[] = [
  {
    id: "velocityehs",
    name: "VelocityEHS",
    platform: "Accelerate Platform",
    officialUrl: "https://www.ehs.com/",
    retrieved: "2026-08-19",
    sourceType: "Official company website",
    reliability: "Company Statement",
    statedPositioning: "VelocityEHS describes Accelerate as a connected platform for managing environmental, health, safety, and sustainability work.",
    modules: ["Safety", "Ergonomics", "Chemical Management", "Contractor Safety", "Operational Risk", "Sustainability", "Environmental Compliance", "Industrial Hygiene"],
    marketRelevance: ["Construction", "Manufacturing", "Energy & Utilities", "Waste & Water"],
    evidenceStatus: "Official source mapped",
  },
  {
    id: "cority",
    name: "Cority",
    platform: "CorityOne",
    officialUrl: "https://www.cority.com/",
    retrieved: "2026-08-19",
    sourceType: "Official company website",
    reliability: "Company Statement",
    statedPositioning: "Cority describes CorityOne as a converged EHS+ platform spanning environmental, health, safety, sustainability, and quality workflows.",
    modules: ["Risk Management", "Incident Management", "Occupational Health", "Industrial Hygiene", "Audits", "Compliance", "Sustainability", "Waste", "Chemical Management"],
    marketRelevance: ["Construction", "Manufacturing", "Energy & Utilities", "Waste & Water"],
    evidenceStatus: "Official source mapped",
  },
  {
    id: "benchmark-gensuite",
    name: "Benchmark Gensuite",
    platform: "Benchmark Gensuite",
    officialUrl: "https://benchmarkgensuite.com/solutions/environmental-health-safety-software/",
    retrieved: "2026-08-19",
    sourceType: "Official company website",
    reliability: "Company Statement",
    statedPositioning: "Benchmark Gensuite describes a unified EHS platform for safety, environmental compliance, and operational risk management.",
    modules: ["Corrective Actions", "Obligation Management", "Incident Management", "Inspections", "Concern Reporting", "Environmental", "Sustainability"],
    marketRelevance: ["Construction", "Manufacturing", "Energy & Utilities"],
    evidenceStatus: "Official source mapped",
  },
  {
    id: "sphera",
    name: "Sphera",
    platform: "SpheraCloud",
    officialUrl: "https://sphera.com/",
    retrieved: "2026-08-19",
    sourceType: "Official company website",
    reliability: "Company Statement",
    statedPositioning: "Sphera describes its Operational Intelligence approach as connecting risk, safety, sustainability, product stewardship, supply-chain risk, and operational risk.",
    modules: ["Environment, Health, Safety & Sustainability", "Product Stewardship", "Supply Chain Risk", "Operational Risk", "Sustainability"],
    marketRelevance: ["Manufacturing", "Energy & Utilities", "Waste & Water"],
    evidenceStatus: "Official source mapped",
  },
];
