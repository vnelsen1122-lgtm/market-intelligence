export type PlanType = "Full State Plan" | "Public Sector Only" | "Federal OSHA";

export type Jurisdiction = {
  code: string;
  name: string;
  planType: PlanType;
  privateSectorAuthority: string;
  publicSectorAuthority: string;
  connectorStatus: "Federal dataset mapped" | "Jurisdiction connector required";
};

const fullStatePlans = new Set([
  "AK", "AZ", "CA", "HI", "IN", "IA", "KY", "MD", "MI", "MN", "NV", "NM", "NC", "OR", "PR", "SC", "TN", "UT", "VT", "VA", "WA", "WY",
]);

const publicSectorPlans = new Set(["CT", "IL", "ME", "MA", "NJ", "NY", "VI"]);

const jurisdictionNames: Array<[string, string]> = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"], ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"], ["PR", "Puerto Rico"], ["VI", "U.S. Virgin Islands"],
];

export const jurisdictions: Jurisdiction[] = jurisdictionNames.map(([code, name]) => {
  if (fullStatePlans.has(code)) {
    return {
      code,
      name,
      planType: "Full State Plan",
      privateSectorAuthority: `${name} OSHA-approved State Plan`,
      publicSectorAuthority: `${name} OSHA-approved State Plan`,
      connectorStatus: "Jurisdiction connector required",
    };
  }
  if (publicSectorPlans.has(code)) {
    return {
      code,
      name,
      planType: "Public Sector Only",
      privateSectorAuthority: "Federal OSHA",
      publicSectorAuthority: `${name} OSHA-approved public-sector plan`,
      connectorStatus: "Jurisdiction connector required",
    };
  }
  return {
    code,
    name,
    planType: "Federal OSHA",
    privateSectorAuthority: "Federal OSHA",
    publicSectorAuthority: "Not covered by federal OSHA; verify state/local law",
    connectorStatus: "Federal dataset mapped",
  };
});

export const jurisdictionCounts = {
  full: jurisdictions.filter((item) => item.planType === "Full State Plan").length,
  publicOnly: jurisdictions.filter((item) => item.planType === "Public Sector Only").length,
  federal: jurisdictions.filter((item) => item.planType === "Federal OSHA").length,
};
