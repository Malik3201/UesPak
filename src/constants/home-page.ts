import type { HomePageContent } from "@/types/home-page";

export const HOME_PAGE_KEY = "home-page";

export const DEFAULT_HOME_PAGE_CONTENT: HomePageContent = {
  key: HOME_PAGE_KEY,
  status: "published",
  hero: {
    eyebrow: "Universal Engineering Services",
    title: "Engineering, Automation & Agriculture Solutions for Modern Industries",
    subtitle: "UESPAK",
    description:
      "UESPAK delivers professional engineering, HVAC-R, facility management, industrial automation, and agriculture-focused solutions for commercial, industrial, healthcare, pharmaceutical, and infrastructure environments.",
    primaryButtonText: "Explore Services",
    primaryButtonUrl: "/services",
    secondaryButtonText: "View Projects",
    secondaryButtonUrl: "/projects",
    backgroundImages: [],
    badges: ["Engineering Excellence", "Industrial Automation", "Agriculture Solutions"],
    isActive: true,
  },
  featuredServices: {
    title: "Featured Services",
    subtitle: "Engineering & Agriculture Expertise",
    description:
      "Explore selected services designed for technical performance, efficiency, and long-term value.",
    serviceIds: [],
    isActive: true,
  },
  servicesOverview: {
    eyebrow: "What We Offer",
    title: "Integrated Engineering and Agriculture Capability",
    description:
      "From HVAC-R and facility systems to automation and sustainable agriculture implementation, UESPAK supports complex requirements across sectors.",
    isActive: true,
  },
  whyChooseUs: {
    eyebrow: "Why UESPAK",
    title: "Why Choose UESPAK",
    description:
      "A trusted delivery partner for engineering precision, structured execution, and practical outcomes.",
    items: [
      { title: "Certified Engineering Expertise" },
      { title: "Multi-Sector Technical Experience" },
      { title: "Reliable Project Execution" },
      { title: "End-to-End Support" },
      { title: "Modern Automation Capabilities" },
      { title: "Sustainable Agriculture Solutions" },
    ],
    isActive: true,
  },
  aboutPreview: {
    eyebrow: "About UESPAK",
    title: "Professional Engineering Partner",
    description:
      "UESPAK combines domain knowledge and execution discipline to deliver reliable solutions for modern industry and infrastructure.",
    buttonText: "About Us",
    buttonUrl: "/about-us",
    isActive: true,
  },
  visionMission: {
    eyebrow: "Our Direction",
    title: "Vision, Mission, and Values",
    visionTitle: "Vision",
    visionDescription:
      "To be a trusted leader in engineering, automation, and agriculture solutions.",
    missionTitle: "Mission",
    missionDescription:
      "Deliver practical, high-quality, and future-ready solutions through technical excellence.",
    valuesTitle: "Values",
    valuesDescription:
      "Integrity, safety, quality, innovation, and client-focused execution.",
    isActive: true,
  },
  stats: {
    title: "Achievements",
    description: "A capability-focused snapshot of UESPAK.",
    items: [
      { label: "Service Areas", value: "10", suffix: "+" },
      { label: "Sector Coverage", value: "Multi-Sector" },
      { label: "Core Focus", value: "Engineering & Agriculture Solutions" },
      { label: "Delivery Model", value: "Client-Focused" },
    ],
    isActive: true,
  },
  featuredProjects: {
    title: "Featured Projects",
    subtitle: "Execution Across Industries",
    description:
      "Selected projects from engineering, agriculture, and industrial automation workstreams.",
    projectIds: [],
    isActive: true,
  },
  industries: {
    title: "Industries We Serve",
    description:
      "UESPAK supports technical and operational requirements across diverse sectors.",
    items: [
      { name: "Healthcare" },
      { name: "Pharmaceuticals" },
      { name: "Industrial Facilities" },
      { name: "Commercial Buildings" },
      { name: "Agriculture" },
      { name: "Energy & Utilities" },
      { name: "FMCG" },
      { name: "Automation & Controls" },
    ],
    isActive: true,
  },
  teamPreview: {
    title: "Our Experts",
    description:
      "A qualified team of engineers and specialists driving project performance.",
    isActive: true,
  },
  clients: {
    title: "Trusted By",
    description:
      "Organizations across sectors rely on UESPAK for dependable technical delivery.",
    logos: [],
    isActive: true,
  },
  profileCTA: {
    eyebrow: "Company Profile",
    title: "Download the UESPAK Company Profile",
    description:
      "Access our capability overview, service scope, and technical strengths.",
    buttonText: "Download Profile",
    isActive: true,
  },
  contactCTA: {
    eyebrow: "Let's Work Together",
    title: "Need a reliable technical partner?",
    description:
      "Share your requirements and our team will get back with the right approach.",
    buttonText: "Contact Us",
    buttonUrl: "/contact-us",
    isActive: true,
  },
  seo: {
    metaTitle: "UESPAK | Engineering, Automation & Agriculture Solutions",
    metaDescription:
      "UESPAK provides engineering, HVAC-R, facility management, industrial automation, and agriculture solutions for modern commercial and industrial sectors.",
    keywords: [
      "engineering services Pakistan",
      "HVAC-R services",
      "industrial automation",
      "facility management",
      "agriculture services Pakistan",
      "mechanical engineering",
      "electrical engineering",
      "UESPAK",
    ],
    schemaType: "WebSite",
    robots: { index: true, follow: true },
  },
};

export function getDefaultHomePageContent(): HomePageContent {
  return structuredClone(DEFAULT_HOME_PAGE_CONTENT);
}

