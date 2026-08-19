export type MarketSegment = {
  id: string;
  vertical: string;
  segment: string;
  naics: string[];
  geographies: string[];
  workforce: string[];
  agencies: string[];
  obligations: string[];
  operationalExposure: string[];
  novaraModules: string[];
};

export const marketSegments: MarketSegment[] = [
  {
    id: "construction-commercial",
    vertical: "Construction",
    segment: "Commercial & institutional construction",
    naics: ["236220"],
    geographies: ["United States", "State", "Metro"],
    workforce: ["General contractors", "Subcontractors", "Temporary labor"],
    agencies: ["OSHA", "State OSHA Plans", "State environmental agencies"],
    obligations: ["Jobsite safety", "Training", "Recordkeeping", "Hazard communication"],
    operationalExposure: ["Multi-employer worksites", "Falls", "Heat", "Mobile equipment"],
    novaraModules: ["Incident Management", "Training", "Contractor Management", "Mobile Forms"],
  },
  {
    id: "construction-infrastructure",
    vertical: "Construction",
    segment: "Heavy civil & infrastructure",
    naics: ["237310", "237990"],
    geographies: ["United States", "State", "Project corridor"],
    workforce: ["Prime contractors", "Specialty trades", "Public-sector contractors"],
    agencies: ["OSHA", "State OSHA Plans", "DOT", "EPA"],
    obligations: ["Jobsite safety", "Environmental permits", "Contractor qualification", "Equipment inspection"],
    operationalExposure: ["Traffic zones", "Excavation", "Heavy equipment", "Distributed crews"],
    novaraModules: ["Contractor Management", "Asset Management", "Incident Management", "Training"],
  },
  {
    id: "construction-data-centers",
    vertical: "Construction",
    segment: "Data center construction",
    naics: ["236210", "236220"],
    geographies: ["United States", "State", "Metro", "Project site"],
    workforce: ["General contractors", "Electrical trades", "Mechanical trades", "Commissioning teams"],
    agencies: ["OSHA", "State OSHA Plans", "Local fire authorities", "EPA"],
    obligations: ["Multi-employer coordination", "Electrical safety", "Training", "Environmental controls"],
    operationalExposure: ["Rapid project scaling", "Energization", "Contractor density", "Schedule pressure"],
    novaraModules: ["Contractor Management", "Training", "Incident Management", "Mobile Forms"],
  },
  {
    id: "manufacturing-durable",
    vertical: "Manufacturing",
    segment: "Durable goods manufacturing",
    naics: ["332", "333", "336"],
    geographies: ["United States", "State", "Plant"],
    workforce: ["Production employees", "Maintenance", "Material handling", "Contractors"],
    agencies: ["OSHA", "EPA", "State environmental agencies"],
    obligations: ["Machine safety", "Hazard communication", "Air and waste compliance", "Recordkeeping"],
    operationalExposure: ["Machine guarding", "Lockout/tagout", "Ergonomics", "Chemical use"],
    novaraModules: ["Incident Management", "Asset Management", "SDS Management", "Training"],
  },
  {
    id: "manufacturing-chemicals",
    vertical: "Manufacturing",
    segment: "Chemical manufacturing",
    naics: ["325"],
    geographies: ["United States", "State", "Facility", "Watershed"],
    workforce: ["Operators", "Maintenance", "Laboratory", "Emergency response"],
    agencies: ["OSHA", "EPA", "State environmental agencies", "DHS"],
    obligations: ["Process safety", "Hazard communication", "Air", "Water", "Hazardous waste"],
    operationalExposure: ["Process hazards", "Chemical releases", "Turnarounds", "Emergency response"],
    novaraModules: ["SDS Management", "Incident Management", "Training", "Asset Management"],
  },
  {
    id: "energy-oil-gas",
    vertical: "Energy & Utilities",
    segment: "Oil & gas operations",
    naics: ["211", "213111", "213112"],
    geographies: ["United States", "State", "Basin", "Site"],
    workforce: ["Operators", "Service contractors", "Drivers", "Maintenance"],
    agencies: ["OSHA", "EPA", "State oil and gas agencies", "DOT / PHMSA"],
    obligations: ["Worker safety", "Environmental reporting", "Contractor oversight", "Emergency response"],
    operationalExposure: ["Remote worksites", "Driving", "Pressure equipment", "Contractor concentration"],
    novaraModules: ["Contractor Management", "Incident Management", "Training", "Mobile Forms"],
  },
  {
    id: "energy-renewables",
    vertical: "Energy & Utilities",
    segment: "Renewable power construction & operations",
    naics: ["221114", "221115", "237130"],
    geographies: ["United States", "State", "Project site"],
    workforce: ["Construction crews", "Technicians", "Electrical contractors", "Asset operators"],
    agencies: ["OSHA", "State OSHA Plans", "FERC", "State utility commissions"],
    obligations: ["Electrical safety", "Working at height", "Contractor oversight", "Environmental permits"],
    operationalExposure: ["Remote assets", "Energization", "Weather", "Specialty contractors"],
    novaraModules: ["Contractor Management", "Asset Management", "Training", "Incident Management"],
  },
  {
    id: "utilities-electric",
    vertical: "Energy & Utilities",
    segment: "Electric power transmission & distribution",
    naics: ["221121", "221122"],
    geographies: ["United States", "State", "Service territory"],
    workforce: ["Lineworkers", "Vegetation contractors", "Field service", "Control-room staff"],
    agencies: ["OSHA", "FERC", "NERC", "State utility commissions"],
    obligations: ["Electrical safety", "Reliability", "Contractor oversight", "Emergency preparedness"],
    operationalExposure: ["High voltage", "Storm response", "Distributed workforce", "Public interface"],
    novaraModules: ["Contractor Management", "Training", "Asset Management", "Incident Management"],
  },
  {
    id: "waste-solid",
    vertical: "Waste & Water",
    segment: "Solid waste collection & disposal",
    naics: ["562111", "562212", "562219"],
    geographies: ["United States", "State", "County", "Facility"],
    workforce: ["Drivers", "Collection crews", "Equipment operators", "Facility staff"],
    agencies: ["OSHA", "EPA", "State environmental agencies", "DOT"],
    obligations: ["Worker safety", "Vehicle safety", "Waste permits", "Environmental monitoring"],
    operationalExposure: ["Transportation", "Heavy equipment", "Public roads", "Hazardous materials"],
    novaraModules: ["Incident Management", "Asset Management", "Training", "Mobile Forms"],
  },
  {
    id: "water-utilities",
    vertical: "Waste & Water",
    segment: "Water & wastewater utilities",
    naics: ["221310", "221320"],
    geographies: ["United States", "State", "Service territory", "Watershed"],
    workforce: ["Plant operators", "Field crews", "Laboratory", "Maintenance"],
    agencies: ["EPA", "OSHA", "State drinking water agencies", "State environmental agencies"],
    obligations: ["Water quality", "Discharge permits", "Confined space", "Chemical safety"],
    operationalExposure: ["Confined spaces", "Treatment chemicals", "Distributed assets", "Public health"],
    novaraModules: ["SDS Management", "Asset Management", "Training", "Incident Management"],
  },
];

export const verticals = Array.from(new Set(marketSegments.map((segment) => segment.vertical)));
