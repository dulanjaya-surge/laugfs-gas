/**
 * About page content.
 *
 * Hardcoded for this first pass; every shape here maps one-to-one onto the
 * Strapi components and collection types that will replace it, so the swap is
 * mechanical.
 *
 * `draft: true` marks copy WE WROTE that is not on the current laugfsgas.lk.
 * It is drawn from the existing material but has not been verified by the
 * client — check every drafted line before this page goes anywhere public.
 */

export type Stat = {
  value: string;
  to?: string; // second figure, for a "30,000 → 45,000" style range
  unit: string;
  label: string;
  note: string;
  draft?: boolean;
};

export type Hotspot = {
  id: string;
  name: string;
  kind: string;
  x: number;
  y: number;
  /** Where the on-map label sits, kept clear of the shipping routes. */
  lx: number;
  ly: number;
  anchor: "start" | "middle" | "end";
  body: string;
  figure?: string;
  draft?: boolean;
};

export type Value = { name: string; body: string; proof: string; draft?: boolean };

export type Milestone = {
  year: string;
  era: string;
  title: string;
  body: string;
  draft?: boolean;
};

export type Subsidiary = {
  name: string;
  role: string;
  body: string;
  facts: string[];
  href?: string;
};

export type Award = {
  year: string;
  name: string;
  result: string;
  category: string;
  /** Trophy photograph. Empty until the client uploads one; the card falls
   *  back to a reserved slot rather than a broken image. */
  image?: string;
  imageAlt?: string;
};

export type Policy = { name: string; group: string };

export type Film = {
  title: string;
  body: string;
  languages: { label: string; note: string }[];
  year: string;
};

// ---------------------------------------------------------------- 01 opening
export const opening = {
  eyebrow: "ABOUT LAUGFS GAS",
  since: 2001,
  title: "We started the year the market opened.",
  accent: "the market opened",
  body:
    "In 2001, Sri Lanka liberalised its LPG market. LAUGFS Gas began operations that " +
    "same year as the country's second downstream player — and has spent the years " +
    "since building the network, the plants and the ships that put gas in kitchens " +
    "from Point Pedro to Hambantota.",
  standfirst: "A Sri Lankan energy company, listed, and still run from Colombo.",
};

// ------------------------------------------------------------- 02 the numbers
export const stats: Stat[] = [
  { value: "26", unit: "", label: "Regional distributors", note: "Covering all 25 districts" },
  { value: "10,000", unit: "+", label: "Dealers island wide", note: "Every corner of Sri Lanka" },
  { value: "3,000", unit: "+ MT", label: "Mabima storage", note: "Storage and bottling, fully automated filling" },
  {
    value: "30,000",
    to: "45,000",
    unit: "MT",
    label: "Hambantota terminal",
    note: "South Asia's largest LPG transshipment terminal, expanding",
  },
  { value: "60,000", unit: "MT / yr", label: "Bangladesh volume", note: "Imported, stored, bottled and distributed" },
  { value: "3", unit: "vessels", label: "Owned LPG fleet", note: "Gas Challenger, Gas Success, Gas Courage" },
];

// ------------------------------------------------------------------ 03 reach
// Positions are lat/lng mapped into the map's 420x620 viewBox.
export const hotspots: Hotspot[] = [
  {
    id: "colombo",
    name: "Colombo",
    kind: "Head office",
    x: 129.8,
    y: 475.9,
    lx: 116,
    ly: 480,
    anchor: "end",
    body: "101 Maya Avenue, Colombo 06 — the company's registered head office since incorporation.",
    figure: "Listed on the CSE since 2010",
  },
  {
    id: "mabima",
    name: "Mabima",
    kind: "Storage & bottling",
    x: 145.2,
    y: 471.2,
    lx: 160,
    ly: 462,
    anchor: "start",
    body:
      "The main storage and bottling plant, with a fully automated cylinder filling line. " +
      "Capacity is being expanded.",
    figure: "3,000+ MT",
  },
  {
    id: "hambantota",
    name: "Hambantota",
    kind: "Transshipment terminal",
    x: 308.1,
    y: 591.3,
    lx: 308,
    ly: 628,
    anchor: "middle",
    body:
      "Operated by LAUGFS Terminals Ltd inside Hambantota International Port. The largest " +
      "LPG transshipment terminal in South Asia, with expansion under way.",
    figure: "30,000 → 45,000 MT",
  },
  {
    id: "trincomalee",
    name: "East coast",
    kind: "Distribution reach",
    x: 321.6,
    y: 238.5,
    lx: 338,
    ly: 243,
    anchor: "start",
    body:
      "The dealer network reaches every district — over 10,000 dealers supplied through " +
      "26 regional distributors.",
    figure: "All 25 districts",
    draft: true,
  },
];

/**
 * Shipping routes. Bearings from Hambantota are real — Chattogram 31°,
 * Chennai 353°, Singapore 101° — but the paths sail around the island rather
 * than across it, because that is what a ship does. `lx/ly` place the label
 * where each route leaves the frame.
 */
export const routes = [
  {
    id: "india",
    label: "India",
    note: "Indian Ocean Rim",
    d: "M 308.1 591.3 C 250 650 150 668 80 638 C 18 612 -4 500 2 372",
    lx: -8,
    ly: 344,
    anchor: "end" as const,
  },
  {
    id: "bangladesh",
    label: "Bangladesh",
    note: "60,000 MT / yr",
    d: "M 308.1 591.3 C 382 638 472 606 494 528 C 518 442 512 262 498 150",
    lx: 514,
    ly: 122,
    anchor: "start" as const,
  },
  {
    id: "sea",
    label: "South-East Asia",
    note: "Ocean freight",
    d: "M 308.1 591.3 C 392 642 502 664 596 642",
    lx: 600,
    ly: 606,
    anchor: "end" as const,
  },
];

export const reach = {
  eyebrow: "REACH",
  title: "How far the gas travels.",
  accent: "the gas",
  body:
    "LAUGFS Gas is no longer only a Sri Lankan company. It is a major LPG player in " +
    "Bangladesh through LAUGFS Gas Bangladesh Ltd, moves cargo on its own fleet across " +
    "the Indian Ocean Rim, and operates South Asia's largest LPG transshipment terminal " +
    "at Hambantota.",
  hint: "Select a location",
};

// ---------------------------------------------------------------- 04 mission
export const mission = {
  eyebrow: "MISSION",
  lead: "To be the leader in the market segments we operate in.",
  points: [
    "Introduce the latest innovations, technology and solutions to add value to the consumer.",
    "Promote a safety culture, encompassing people, products and process.",
    "Ensure fair returns to all our stakeholders.",
    "Lead by example as an exemplary Sri Lankan entity.",
  ],
  philosophyTitle: "The guiding philosophy",
  philosophy:
    "A strong value system guides our business decisions and how we engage with our " +
    "stakeholders. They shape our approach to sustainable, responsible, ethical and " +
    "transparent engagement with all those we touch.",
};

// ----------------------------------------------------------------- 05 values
// The six value names are the client's. Every `proof` line is DRAFTED — each
// ties the value to something the company actually did, so the section is not
// six abstractions in a row.
export const values: Value[] = [
  {
    name: "Integrity & Accountability",
    body: "Doing what we said we would, and answering for it when we do not.",
    proof: "Twelve published governance policies, from whistleblowing to board remuneration.",
    draft: true,
  },
  {
    name: "Innovation & Creativity",
    body: "Finding the way that has not been tried here before.",
    proof: "Registered the LAUGFS Wega in 2002 — the first LPG vessel under the Sri Lankan flag.",
    draft: true,
  },
  {
    name: "Synergy & Teamwork",
    body: "One supply chain, from the ship to the doorstep, run as one operation.",
    proof: "Import, terminal, bottling and dealer network held inside a single group.",
    draft: true,
  },
  {
    name: "Customer Centricity",
    body: "The cylinder has to arrive, safely, at a price a household can plan around.",
    proof: "Partnered with the Consumer Affairs Authority in 2007 on the regulated LPG price formula.",
    draft: true,
  },
  {
    name: "Resilient Leadership",
    body: "Staying with the market through the parts of the cycle nobody enjoys.",
    proof: "Twenty-five years of continuous supply since the market opened in 2001.",
    draft: true,
  },
  {
    name: "Agility to Change",
    body: "Moving early, including across a border.",
    proof: "Acquired Petredec Elpiji in 2014 — the first Sri Lankan energy brand to go multinational.",
    draft: true,
  },
];

// ------------------------------------------------------------- 06 milestones
export const milestones: Milestone[] = [
  {
    year: "1994",
    era: "Formation",
    title: "Gas Auto Lanka",
    body: "Established Gas Auto Lanka (Pvt) Ltd and entered the autogas conversion business.",
  },
  {
    year: "1998",
    era: "Formation",
    title: "World LPG Association",
    body: "Obtained World LPG Association membership.",
  },
  {
    year: "2000",
    era: "Formation",
    title: "LAUGFS Gas Ltd incorporated",
    body: "Obtained Board of Investment approval and incorporated LAUGFS Gas Ltd.",
  },
  {
    year: "2001",
    era: "Formation",
    title: "Into the LPG market",
    body: "Entered Sri Lanka's LPG industry and signed the first supply agreement with the state (CPC).",
  },
  {
    year: "2002",
    era: "Formation",
    title: "The LAUGFS Wega",
    body: "Registered the LAUGFS Wega — the country's first LPG vessel under the Sri Lankan flag.",
  },
  {
    year: "2007",
    era: "Listing",
    title: "The price formula",
    body:
      "Partnered with Sri Lanka's Consumer Affairs Authority to establish the regulated " +
      "price formula for LPG.",
  },
  {
    year: "2010",
    era: "Listing",
    title: "Public listing",
    body:
      "Launched a successful IPO, becoming a publicly traded company on the CSE and inviting " +
      "citizens to share in the growth.",
  },
  {
    year: "2014",
    era: "Regional",
    title: "Across the bay",
    body:
      "Became the first Sri Lankan energy brand with a multinational presence by acquiring " +
      "Petredec Elpiji Ltd, renamed LAUGFS Gas Bangladesh Ltd. Construction began on the " +
      "30,000 MT LPG terminal at Hambantota.",
  },
  {
    year: "2015",
    era: "Fleet",
    title: "A fleet of our own",
    body:
      "Grew the LPG shipping fleet with the vessels Gas Success and Gas Courage, improving " +
      "control over maritime logistics.",
  },
  {
    year: "2017",
    era: "Fleet",
    title: "Gas Courage joins",
    body: "LAUGFS Maritime expanded the LPG vessel fleet with a further addition — Gas Courage.",
  },
  // --- DRAFTED: the milestone page stops at 2017, but the awards list shows
  // --- activity through 2025. These entries are inferred from that list and
  // --- from the at-a-glance page. Dates and wording need confirming.
  {
    year: "2018",
    era: "Fleet",
    title: "Terminal in service",
    body:
      "The Hambantota transshipment terminal enters service as the largest of its kind in " +
      "South Asia, with expansion to 45,000 MT planned.",
    draft: true,
  },
  {
    year: "2021",
    era: "Recognition",
    title: "ISO 9001:2015",
    body:
      "Certified to ISO 9001:2015 — the first downstream LPG company in Sri Lanka to hold the " +
      "quality management standard.",
    draft: true,
  },
  {
    year: "2025",
    era: "Recognition",
    title: "Marketing and sustainability",
    body:
      "Recognised at the Sri Lanka Leadership Awards as Marketing Team of the Year and as an " +
      "organisation with sustainable practices, alongside the WLGA Marketing Excellence Award.",
    draft: true,
  },
];

export const eras = ["Formation", "Listing", "Regional", "Fleet", "Recognition"];

// ----------------------------------------------------------- 07 subsidiaries
export const subsidiaries: Subsidiary[] = [
  {
    name: "LAUGFS Maritime Services",
    role: "Ocean freight & logistics",
    body:
      "Provides ocean freight and logistics for LPG. With its own fleet it handles import, " +
      "export and distribution, serving growing LPG demand across South and South-East Asia.",
    facts: ["Gas Challenger", "Gas Success", "Gas Courage"],
    href: "https://www.laugfsmaritime.com",
  },
  {
    name: "LAUGFS Terminals Ltd",
    role: "Transshipment",
    body:
      "Owner and operator of South Asia's largest LPG transshipment terminal at Hambantota " +
      "Port. With expansion planned to 45,000 MT, it is the cornerstone of regional logistics.",
    facts: ["30,000 MT today", "45,000 MT planned", "Hambantota International Port"],
  },
  {
    name: "LAUGFS Gas Bangladesh",
    role: "Downstream, Bangladesh",
    body:
      "One of the largest LPG downstream players in the Bangladesh market — importing, storing, " +
      "bottling and distributing LPG, and the reason LAUGFS became a multinational brand.",
    facts: ["Acquired 2014", "60,000 MT / yr", "Formerly Petredec Elpiji"],
  },
];

// DRAFTED: the subsidiaries page claims "integrated operations from production
// to delivery" without showing it. This chain makes that claim concrete.
export const chain = [
  { step: "Import", body: "Own vessels bring cargo from source markets." },
  { step: "Terminal", body: "Hambantota receives and stores at scale." },
  { step: "Bottling", body: "Mabima fills and seals cylinders automatically." },
  { step: "Distribution", body: "26 regional distributors move stock inland." },
  { step: "Dealer", body: "10,000+ dealers hold stock in every district." },
  { step: "Home", body: "The cylinder is exchanged at the door." },
];

// -------------------------------------------------------------- 08 awards
export const isoAward = {
  title: "ISO 9001:2015",
  claim: "The first downstream LPG company in Sri Lanka to be certified.",
  body:
    "Quality Management System certification — proof that best practice in quality and " +
    "service is documented and audited, not asserted.",
};

export const awards: Award[] = [
  { year: "2025", name: "WLGA Marketing Excellence Award", result: "Winner", category: "Marketing" },
  { year: "2025", name: "Sri Lanka Leadership Awards — Marketing Team of the Year", result: "Winner", category: "Marketing" },
  { year: "2025", name: "Sri Lanka Leadership Awards — Sustainable practices", result: "Winner", category: "Citizenship" },
  { year: "2024", name: "TAGS Awards", result: "Winner", category: "Reporting" },
  { year: "2021", name: "CA Annual Report Awards", result: "Winner", category: "Reporting" },
  { year: "2019", name: "CA Annual Report Awards", result: "Winner", category: "Reporting" },
  { year: "2018", name: "CA Sri Lanka Annual Report Awards", result: "Winner", category: "Reporting" },
  { year: "2017", name: "CA Annual Report Awards", result: "Gold", category: "Reporting" },
  { year: "2016", name: "CA Annual Report Awards", result: "Gold", category: "Reporting" },
  { year: "2016", name: "CNCI Achiever Awards", result: "Top Ten", category: "Industry" },
  { year: "2015", name: "CA Annual Report Awards", result: "Gold", category: "Reporting" },
  { year: "2015", name: "National Business Excellence Awards", result: "Winner", category: "Citizenship" },
  { year: "2015", name: "Best Sri Lankan Website — Commercial", result: "Silver", category: "Marketing" },
  { year: "2015", name: "CNCI Industrial Excellence", result: "Silver", category: "Industry" },
  { year: "2014", name: "Best Corporate Citizen Award", result: "Winner", category: "Citizenship" },
  { year: "2014", name: "CNCI Industrial Excellence", result: "Silver", category: "Industry" },
  { year: "2014", name: "Annual Report Awards — Power & Energy", result: "Gold", category: "Reporting" },
  { year: "2014", name: "National Business Excellence Awards", result: "Winner", category: "Citizenship" },
  { year: "2014", name: "CNCI Top Ten Achiever Award", result: "Top Ten", category: "Industry" },
  { year: "2013", name: "CNCI Achiever", result: "Winner", category: "Industry" },
  { year: "2013", name: "CNCI Achiever of Industrial Excellence", result: "Bronze", category: "Industry" },
  { year: "2008", name: "National Safety Award", result: "Runner-up", category: "Safety" },
  { year: "2008", name: "Industrial Safety Award", result: "2nd Runner-up", category: "Safety" },
  { year: "2006", name: "Industrial Safety Award", result: "Merit", category: "Safety" },
  { year: "2006", name: "National Productivity Award", result: "Winner", category: "Industry" },
  { year: "—", name: "The National Quality Award", result: "Winner", category: "Industry" },
];

// ------------------------------------------------------------- 09 commitment
export const commitment = {
  eyebrow: "SOCIAL COMMITMENT",
  title: "What we give back.",
  accent: "give back",
  intro:
    "LAUGFS Gas PLC is a subsidiary of LAUGFS Holdings Limited, which also operates in " +
    "services, leisure and property. As a homegrown organisation we give back where we can — " +
    "to raise living standards, and to protect treasured Sri Lankan heritage.",
  items: [
    {
      name: "Dalada Maligawa",
      body:
        "LAUGFS Gas provides LPG free of charge to all Dalada Maligawa staff and priests, " +
        "supplied monthly, supporting the smooth running of the religious rites of the " +
        "sacred institute.",
      caption: "Sri Dalada Maligawa, Kandy",
    },
    {
      name: "Sri Pada — Adam's Peak",
      body:
        "Gas and gas lines are supplied free of charge to the Adam's Peak staff and priests, " +
        "for daily use and for the weekly offering at the Sumana Saman Dewalaya. We support " +
        "this symbolic monument, close to all Sri Lankan hearts.",
      caption: "Sri Pada, Ratnapura",
    },
  ],
};

// --------------------------------------------------------------- 10 policies
export const policies: Policy[] = [
  { name: "Matters Relating to the Board", group: "Board & governance" },
  { name: "Board Committees", group: "Board & governance" },
  { name: "Corporate Governance, Nominations and Re-elections", group: "Board & governance" },
  { name: "Remuneration", group: "Board & governance" },
  { name: "Internal Code of Business Conduct and Ethics", group: "Conduct & ethics" },
  { name: "Anti-bribery and Corruption", group: "Conduct & ethics" },
  { name: "Whistleblowing", group: "Conduct & ethics" },
  { name: "Corporate Disclosures", group: "Conduct & ethics" },
  { name: "Risk Management and Internal Controls", group: "Risk & sustainability" },
  { name: "Control and Management of Company Assets and Shareholder Investments", group: "Risk & sustainability" },
  { name: "Relations with Investors and Shareholders", group: "Risk & sustainability" },
  { name: "Environmental, Social and Governance Sustainability", group: "Risk & sustainability" },
];

export const policyGroups = ["Board & governance", "Conduct & ethics", "Risk & sustainability"];

// ------------------------------------------------------------------ 11 films
export const films: Film[] = [
  {
    title: "Mulu ratatama batha idawana ape LAUGFS Gas",
    body:
      "The national LPG awareness campaign, produced in all three languages of the country.",
    year: "2010",
    languages: [
      { label: "සිංහල", note: "Sinhala" },
      { label: "English", note: "English" },
      { label: "தமிழ்", note: "Tamil" },
    ],
  },
  {
    title: "LAUGFS Gas PLC campaign",
    body: "The 2018 continuation of the national campaign.",
    year: "2018",
    languages: [{ label: "සිංහල", note: "Sinhala" }],
  },
  {
    title: "LAUGFS Gas 5kg",
    body: "The 5kg cylinder — made for smaller kitchens and for the road.",
    year: "—",
    languages: [{ label: "සිංහල", note: "Sinhala" }],
  },
];

// ------------------------------------------------------------------ 12 close
export const close = {
  title: "Where would you like to go next?",
  accent: "next",
  links: [
    { label: "Find a refill price", href: "/refill", primary: true },
    { label: "Investor centre", href: "/#investors" },
    { label: "Contact us", href: "/#contact" },
  ],
};

/** The page's own table of contents, used by the sticky section rail. */
export const sections = [
  { id: "open", label: "Since 2001" },
  { id: "numbers", label: "The numbers" },
  { id: "reach", label: "Reach" },
  { id: "mission", label: "Mission" },
  { id: "values", label: "Values" },
  { id: "timeline", label: "Milestones" },
  { id: "companies", label: "Companies" },
  { id: "recognition", label: "Recognition" },
  { id: "commitment", label: "Commitment" },
  { id: "governance", label: "Governance" },
  { id: "films", label: "Films" },
  { id: "next", label: "Next" },
];
