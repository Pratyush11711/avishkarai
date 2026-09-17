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
    canvas: "#eef1f6",
    ink: "#12182a",
    muted: "#5c6578",
    accent: "#2f5fbf",
    deep: "#12182a",
    wash: "#dce4f2",
    glow: "#4fd0c8",
  },
  research: {
    mood: "research",
    canvas: "#f1f3f6",
    ink: "#1b2140",
    muted: "#667088",
    accent: "#4f8f82",
    deep: "#1b2140",
    wash: "#dce8e4",
    glow: "#9aa4d6",
  },
};

// Illustrative copy for layout review. Replace with approved case-study content.
export const workStudies = [
  {
    slug: "frontier-biomed",
    title: "Frontier Biomed",
    lines: ["Frontier", "Biomed"],
    sector: "Telehealth",
    image: "/work/work-frontier-biomed.png",
    lead: "A more human connection to care. A digital experience designed around the people who need it.",
    description: [
      "Frontier Biomed explores a simpler way to connect people with everyday healthcare. This concept brings discovery, appointments, and ongoing support together in one clear, considered digital experience.",
      "The direction begins with reassurance: a calm interface, useful information at the right moment, and fewer steps between a question and its answer. Every screen is imagined as part of the same patient journey.",
      "From the first interaction to a follow-up, the proposed product balances a welcoming identity with practical tools for care teams. The media below illustrates the direction while final project assets are prepared.",
    ],
    services: ["Product strategy", "UX & UI design", "Design system", "Web development"],
    statement: "Care, without the complexity.",
    theme: THEMES.biomed,
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
    image: "/work/work-medivance.png",
    lead: "Less friction behind the scenes. More space for teams to focus on the work that matters.",
    description: [
      "Medivance explores how a shared digital workspace could simplify the everyday rhythm of a clinical team. Tasks, information, and handoffs come together in a focused interface.",
      "Complex workflows need clear priorities. The proposed system uses a consistent visual language to help people understand where things stand and what needs their attention.",
      "A modular foundation makes room for new workflows as the team grows. The screens and narrative here are illustrative placeholders rather than a record of delivered outcomes.",
    ],
    services: ["Workflow strategy", "Dashboard design", "Design system", "Engineering"],
    statement: "Clarity is a competitive advantage.",
    theme: THEMES.ops,
  },
  {
    slug: "house-of-life-sciences",
    title: "House of Life Sciences",
    lines: ["House of", "Life Sciences"],
    sector: "Research",
    image: "/work/work-house-of-life-sciences.png",
    lead: "A home for ideas that move science forward. Connecting people, research, and possibility.",
    description: [
      "House of Life Sciences imagines a digital meeting place for a research community. Discoveries, expertise, and opportunities share a thoughtful editorial platform.",
      "The creative direction makes complex subjects feel approachable through strong typography, purposeful imagery, and a clear content hierarchy. Each story has space to unfold.",
      "A flexible publishing foundation would help the team share its evolving work. The media and project narrative are placeholders for an approved case study.",
    ],
    services: ["Creative direction", "Content strategy", "Web design", "Development"],
    statement: "Ideas deserve room to grow.",
    theme: THEMES.research,
  },
] as const;

export type WorkStudy = (typeof workStudies)[number];
