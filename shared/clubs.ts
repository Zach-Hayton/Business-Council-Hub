export const CLUB_ORDER = [
  "180-degrees-consulting",
  "consulting-group",
  "bfic",
  "investment-advisory-network",
  "oso-launch",
  "delta-sigma-pi",
  "alpha-kappa-psi",
  "scholars-of-finance",
  "startup-innovation-club",
  "ai-society",
  "accounting-society",
  "bahr",
  "real-estate-club",
  "women-in-business",
  "ama",
  "hso",
];
export const DIRECTORY_URL = "https://hankamer.baylor.edu/student-resources/organizations";
type Contact = {
  name: string;
  role: string;
  email?: string;
  url: string;
};
export type ClubDetail = {
  website: string;
  sourceUrl: string;
  size: string | null;
  sizeNote?: string;
  sizeSource?: string;
  contacts: Contact[];
  name?: string;
  short?: string;
};
const cgb = "https://www.consultinggroupatbaylor.com/";
const dc = "https://180dc.org/branches/baylor-university";
export const CLUB_DETAILS: Record<string, ClubDetail> = {
  "180-degrees-consulting": {
    website: dc,
    sourceUrl: dc,
    size: null,
    contacts: [
      { name: "Ava Truan", role: "Director of Recruitment", email: "atruan@180dc.org", url: dc },
      { name: "Branch team", role: "General inquiries", email: "baylor@180dc.org", url: dc },
    ],
  },
  "consulting-group": {
    website: cgb,
    sourceUrl: cgb,
    size: "80+ members",
    sizeSource: cgb + "team.html",
    sizeNote: "Published on the club's team page",
    contacts: [
      { name: "Joshua Yoon", role: "Managing Director", url: cgb + "team.html" },
      {
        name: "Yash Balasubramanian",
        role: "Director of Recruitment",
        email: "cgb@baylor.edu",
        url: cgb + "team.html",
      },
    ],
  },
  bfic: {
    website: "https://www.bfic.net/",
    sourceUrl: "https://www.bfic.net/",
    size: "35+ members",
    sizeSource: "https://www.bfic.net/",
    sizeNote: "Founding-year figure published by BFIC; not a live count",
    contacts: [
      {
        name: "BFIC leadership",
        role: "Membership inquiries",
        email: "bufinance.23@gmail.com",
        url: "https://www.bfic.net/",
      },
    ],
  },
  "investment-advisory-network": {
    website: "https://hankamer.baylor.edu/investment-advisory-network",
    sourceUrl: "https://hankamer.baylor.edu/investment-advisory-network",
    size: null,
    contacts: [
      {
        name: "Emma Rabineau",
        role: "Student liaison",
        email: "Emma_Rabineau1@baylor.edu",
        url: "https://hankamer.baylor.edu/investment-advisory-network",
      },
      {
        name: "Hailey Moon",
        role: "Student liaison",
        email: "Hailey_Moon1@baylor.edu",
        url: "https://hankamer.baylor.edu/investment-advisory-network",
      },
    ],
  },
  "oso-launch": {
    website: "https://osolaunch.com/",
    sourceUrl: "https://osolaunch.com/",
    size: null,
    contacts: [
      {
        name: "Oso Launch team",
        role: "Leadership & applications",
        url: "https://osolaunch.com/leadership",
      },
    ],
  },
  "delta-sigma-pi": {
    website: "https://www.linkedin.com/company/baylor-delta-sigma-pi/",
    sourceUrl: DIRECTORY_URL,
    size: null,
    contacts: [],
  },
  "alpha-kappa-psi": {
    website: "https://www.instagram.com/akpsibaylor/",
    sourceUrl: DIRECTORY_URL,
    size: null,
    contacts: [],
  },
  "scholars-of-finance": {
    website: "https://www.instagram.com/sof.baylor/",
    sourceUrl: DIRECTORY_URL,
    size: null,
    contacts: [],
  },
  "startup-innovation-club": {
    website: "https://padlet.com/StartupandInnovationClub/startup-innovation-club-ckemqx1adze2wmpf",
    sourceUrl: DIRECTORY_URL,
    size: null,
    contacts: [
      {
        name: "Startup & Innovation team",
        role: "Membership inquiries",
        email: "startupinnovation@baylor.edu",
        url: DIRECTORY_URL,
      },
    ],
  },
  "ai-society": {
    website: "https://baylor.campuslabs.com/engage/",
    sourceUrl: DIRECTORY_URL,
    size: null,
    contacts: [],
  },
  "accounting-society": {
    website: "https://accountingsocietyatbaylor.org/",
    sourceUrl: DIRECTORY_URL,
    size: null,
    contacts: [],
  },
  bahr: {
    website: "https://hankamer.baylor.edu/management/resources/bahr",
    sourceUrl: DIRECTORY_URL,
    size: null,
    contacts: [],
  },
  "real-estate-club": {
    name: "Real Estate Network at Baylor",
    short: "REN",
    website: "https://www.linkedin.com/company/real-estate-club-at-baylor",
    sourceUrl: DIRECTORY_URL,
    size: null,
    contacts: [],
  },
  "women-in-business": {
    website: "https://hankamer.baylor.edu/women-in-business",
    sourceUrl: DIRECTORY_URL,
    size: "300+ members",
    sizeSource: DIRECTORY_URL,
    sizeNote: "Published by Hankamer; not a live count",
    contacts: [],
  },
  ama: {
    website: "https://hankamer.baylor.edu/marketing/resources/american-marketing-association",
    sourceUrl: DIRECTORY_URL,
    size: null,
    contacts: [
      {
        name: "AMA chapter team",
        role: "Membership inquiries",
        email: "AMA_HSB@baylor.edu",
        url: DIRECTORY_URL,
      },
    ],
  },
  hso: {
    website: "https://hankamer.baylor.edu/student-resources/organizations/hso",
    sourceUrl: DIRECTORY_URL,
    size: null,
    contacts: [],
  },
};
export const clubRank = (slug: string) => CLUB_ORDER.indexOf(slug);
