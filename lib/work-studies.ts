export type StudyMood = "biomed" | "wellness" | "guiding" | "ops" | "research";

export type StudyTheme = {
  mood: StudyMood;
  canvas: string;
  ink: string;
  muted: string;
  accent: string;
  deep: string;
  wash: string;
  glow: string;
};

export type StudyShot = {
  role: "film" | "product" | "poster" | "mobile" | "desktop" | "wide" | "detail" | "still";
  src: string;
  alt: string;
  caption: string;
  fit?: "cover" | "contain";
  beside?: "film";
};

// Palettes pulled from each project's mockup — one accent, dark ground, quiet wash.
const THEMES: Record<StudyMood, StudyTheme> = {
  biomed: {
    mood: "biomed",
    canvas: "#f3f1ec",
    ink: "#1a2c2c",
    muted: "#5d6e6a",
    accent: "#2f6b66",
    deep: "#1a2c2c",
    wash: "#e4ebe6",
    glow: "#c4a574",
  },
  wellness: {
    mood: "wellness",
    canvas: "#f6f2f8",
    ink: "#2a2740",
    muted: "#6e6880",
    accent: "#6d63a6",
    deep: "#2a2740",
    wash: "#ece6f4",
    glow: "#8fa382",
  },
  guiding: {
    mood: "guiding",
    canvas: "#f6f1ea",
    ink: "#1c2438",
    muted: "#6b645c",
    accent: "#c45a28",
    deep: "#1c2438",
    wash: "#f1e2d2",
    glow: "#e8a15a",
  },
  ops: {
    mood: "ops",
    canvas: "#f3f4f6",
    ink: "#12141a",
    muted: "#5e6773",
    accent: "#3d5f7a",
    deep: "#101018",
    wash: "#e6eef2",
    glow: "#8aa8b8",
  },
  research: {
    mood: "research",
    canvas: "#eef2ea",
    ink: "#101820",
    muted: "#5c6a74",
    accent: "#c5d43a",
    deep: "#070c22",
    wash: "#e4ebc6",
    glow: "#7ea3dc",
  },
};

export const workStudies = [
  {
    slug: "frontier-biomed",
    title: "Frontier Biomed",
    lines: ["Frontier", "Biomed"],
    sector: "Clinic platform",
    image: "/frontier-biomed/Laptop_displaying_medical.png",
    lead: "One platform for everything a clinic prescribes. Source, prescribe, and dispense without the vendor maze.",
    description: [
      "Frontier Biomed is a practice platform for modern wellness clinics: pharmaceuticals, peptides, and the operations around them, in one considered product.",
      "We designed the waitlist, catalog, and affiliate tools as the same system. Clinics can browse inventory, place orders, and track referrals without jumping between vendors or spreadsheets.",
      "The identity stays calm and clinical. Product photography, tablet workflows, and the desktop dashboard all share one teal language so the brand feels as precise as the supply chain behind it.",
    ],
    services: ["Product strategy", "UX & UI design", "Design system", "Web development"],
    statement: "Care, without the complexity.",
    theme: THEMES.biomed,
    gallery: [
      {
        role: "film",
        src: "/frontier-biomed/Peptide_vials_on_catalog_page_.jpg",
        alt: "Frontier BioMed peptide vials, Tesamorelin, BPC-157, and DSIP",
        caption: "Product line",
      },
      {
        role: "poster",
        src: "/frontier-biomed/Mobile_landing_page_design_mockup.png",
        alt: "Frontier Biomed mobile landing page with waitlist",
        caption: "Mobile landing",
      },
      {
        role: "mobile",
        src: "/frontier-biomed/Hand-Holding-Phone.jpg",
        alt: "Frontier Biomed mobile site held in hand",
        caption: "In hand",
      },
      {
        role: "desktop",
        src: "/frontier-biomed/Affiliate_dashboard_product_show.png",
        alt: "Frontier Biomed affiliate dashboard on a desktop display",
        caption: "Affiliate dashboard",
      },
      {
        role: "detail",
        src: "/frontier-biomed/Peptide_catalog_displayed_on_tablet.jpg",
        alt: "Frontier Biomed peptide catalog on a tablet in a lab",
        caption: "Catalog",
      },
      {
        role: "still",
        src: "/frontier-biomed/tablet-affiliate-dashboard.jpg",
        alt: "Frontier Biomed affiliate dashboard on a tablet",
        caption: "On the desk",
      },
    ],
  },
  {
    slug: "frontier-wellness",
    title: "Frontier Wellness",
    lines: ["Frontier", "Wellness"],
    sector: "Mental Health",
    image: "/work/work-frontier-wellness.png",
    lead: "Space to feel understood. Making the first step towards better wellbeing a little easier.",
    description: [
      "Frontier Wellness imagines a welcoming home for mental health support. People can discover practitioners, explore resources, and find a starting point that feels right for them.",
      "A softer visual rhythm gives the content room to breathe. Clear language and thoughtful booking flows keep the experience approachable, especially when taking the first step feels difficult.",
      "The concept pairs a flexible publishing system with an accessible product foundation. These visuals and descriptions are placeholders for the final case study.",
    ],
    services: ["Experience strategy", "Art direction", "UI design", "Web development"],
    statement: "A little space. A new beginning.",
    theme: THEMES.wellness,
    listed: false,
  },
  {
    slug: "guiding-hands",
    title: "Guiding Hands",
    lines: ["Guiding", "Hands"],
    sector: "Care Navigation",
    image: "/work/work-guiding-hands.png",
    lead: "A clear next step, every step of the way. Helping families find their way through care.",
    description: [
      "Guiding Hands is a concept for making complex care journeys easier to navigate. It brings useful resources, conversations, and next steps into one supportive digital environment.",
      "The proposed experience is built around small, meaningful actions: understand the options, connect with the right person, and keep track of what comes next. A warm identity gives the practical tools a human voice.",
      "Flexible journeys would support different needs without making the interface feel complicated. Placeholder imagery and copy show the intended creative direction.",
    ],
    services: ["Discovery", "Journey mapping", "Product design", "Platform development"],
    statement: "No one should navigate alone.",
    theme: THEMES.guiding,
  },
  {
    slug: "medivance",
    title: "Medivance",
    lines: ["Medivance"],
    sector: "Clinical Operations",
    image: "/medivance/laptop.png",
    lead: "Less friction behind the scenes. More space for teams to focus on the work that matters.",
    description: [
      "Medivance explores how a shared digital workspace could simplify the everyday rhythm of a clinical team. Tasks, information, and handoffs come together in a focused interface.",
      "Complex workflows need clear priorities. The proposed system uses a consistent visual language to help people understand where things stand and what needs their attention.",
      "A modular foundation makes room for new workflows as the team grows. The screens and narrative here are illustrative placeholders rather than a record of delivered outcomes.",
    ],
    services: ["Workflow strategy", "Dashboard design", "Design system", "Engineering"],
    statement: "Clarity is a competitive advantage.",
    theme: THEMES.ops,
    gallery: [
      {
        role: "film",
        src: "/medivance/homepage.png",
        alt: "Medivance homepage, Purity you can see on Paper",
        caption: "Homepage",
      },
      {
        role: "product",
        src: "/medivance/process.png",
        alt: "Medivance standard process, source, document, verify, confirm",
        caption: "Process",
      },
      {
        role: "mobile",
        src: "/medivance/phone.png",
        alt: "Medivance mobile site held in a lab",
        caption: "In hand",
      },
      {
        role: "desktop",
        src: "/medivance/desktop-overview.png",
        alt: "Medivance operations overview on a desktop display",
        caption: "Overview",
      },
      {
        role: "detail",
        src: "/medivance/tablet-catalog.png",
        alt: "Medivance product catalog on a tablet",
        caption: "Catalog",
      },
      {
        role: "still",
        src: "/medivance/tablet-certificate.png",
        alt: "Medivance certificate of analysis on a tablet",
        caption: "Certificate",
      },
    ],
  },
  {
    slug: "house-of-life-sciences",
    title: "House of Life Sciences",
    lines: ["House of", "Life Sciences"],
    sector: "Research",
    image: "/house-of-life-sciences/laptop.png",
    lead: "A home for ideas that move science forward. Connecting people, research, and possibility.",
    description: [
      "House of Life Sciences imagines a digital meeting place for a research community. Discoveries, expertise, and opportunities share a thoughtful editorial platform.",
      "The creative direction makes complex subjects feel approachable through strong typography, purposeful imagery, and a clear content hierarchy. Each story has space to unfold.",
      "A flexible publishing foundation would help the team share its evolving work. The media and project narrative are placeholders for an approved case study.",
    ],
    services: ["Creative direction", "Content strategy", "Web design", "Development"],
    statement: "Ideas deserve room to grow.",
    theme: THEMES.research,
    gallery: [
      {
        role: "film",
        src: "/house-of-life-sciences/home.png",
        alt: "House of Life Sciences homepage",
        caption: "Homepage",
        fit: "contain",
      },
      {
        role: "product",
        src: "/house-of-life-sciences/product-landing.png",
        alt: "House of Life Sciences NAD+ product landing page",
        caption: "Product",
      },
      {
        role: "mobile",
        src: "/house-of-life-sciences/phone.png",
        alt: "House of Life Sciences mobile site held in hand",
        caption: "In hand",
      },
      {
        role: "desktop",
        src: "/house-of-life-sciences/affiliate-desktop.png",
        alt: "House of Life Sciences affiliate dashboard on a desktop display",
        caption: "Affiliate dashboard",
      },
      {
        role: "still",
        src: "/house-of-life-sciences/tablet-plans.png",
        alt: "House of Life Sciences membership plans on a tablet",
        caption: "Plans",
        beside: "film",
      },
      {
        role: "detail",
        src: "/house-of-life-sciences/tablet.png",
        alt: "House of Life Sciences course catalog on a tablet",
        caption: "Catalog",
      },
    ],
  },
] as const;

export const listedWorkStudies = workStudies.filter(
  (study) => !("listed" in study && study.listed === false),
);

export type WorkStudy = (typeof workStudies)[number];
