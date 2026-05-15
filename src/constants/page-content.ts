import type {
  AboutPageContent,
  CareersPageContent,
  ContactPageContent,
  PageKey,
  ProjectsPageContent,
  ServicesPageContent,
} from "@/types/page-content";

export const PAGE_SLUGS: Record<PageKey, string> = {
  about: "/about-us",
  careers: "/careers",
  contact: "/contact-us",
  services: "/services",
  projects: "/projects",
};

export const PAGE_FALLBACK_TITLES: Record<PageKey, string> = {
  about: "About UESPAK",
  careers: "Careers at UESPAK",
  contact: "Contact UESPAK",
  services: "Engineering & Agriculture Services",
  projects: "Engineering, Agriculture & Automation Projects",
};

export const PAGE_SEO_FALLBACKS: Record<
  PageKey,
  { title: string; description: string; schemaType: string }
> = {
  about: {
    title: "About UESPAK | Engineering, Automation & Agriculture Solutions",
    description:
      "Learn about UESPAK – a professional engineering, automation and agriculture services partner delivering reliable solutions across modern industries.",
    schemaType: "AboutPage",
  },
  careers: {
    title: "Careers at UESPAK | Join Our Engineering Team",
    description:
      "Join a team focused on engineering excellence, technical reliability and practical solutions for engineering, automation and agriculture sectors.",
    schemaType: "WebPage",
  },
  contact: {
    title: "Contact UESPAK | Engineering & Technical Services",
    description:
      "Get in touch with UESPAK for engineering, automation, HVAC-R, facility management and agriculture-focused project enquiries.",
    schemaType: "ContactPage",
  },
  services: {
    title: "Engineering & Agriculture Services | UESPAK",
    description:
      "Explore UESPAK services across engineering, HVAC-R, facility management, industrial automation and agriculture-focused solutions.",
    schemaType: "CollectionPage",
  },
  projects: {
    title: "Engineering, Agriculture & Automation Projects | UESPAK",
    description:
      "Explore UESPAK projects across engineering, agriculture, facility systems and industrial automation.",
    schemaType: "CollectionPage",
  },
};

export const DEFAULT_ABOUT_PAGE: AboutPageContent = {
  pageKey: "about",
  title: "About UESPAK",
  slug: "/about-us",
  isActive: true,
  hero: {
    eyebrow: "About UESPAK",
    title: "Engineering Reliability for Modern Industries",
    description:
      "Delivering professional engineering, HVAC-R, facility management, industrial automation and agriculture-focused solutions for commercial, industrial, healthcare, pharmaceutical and infrastructure environments.",
    primaryButtonText: "Explore Services",
    primaryButtonUrl: "/services",
    secondaryButtonText: "Contact Us",
    secondaryButtonUrl: "/contact-us",
  },
  sections: {
    overview: {
      eyebrow: "Company Overview",
      title: "A Professional Engineering & Technical Services Partner",
      description:
        "UESPAK combines multi-sector technical experience, structured delivery and engineering discipline to support clients across modern industries with dependable services.",
      highlights: [
        "Engineering & technical services",
        "Industrial automation support",
        "Facility performance & HVAC-R",
        "Agriculture-focused solutions",
      ],
      isActive: true,
    },
    story: {
      eyebrow: "Our Story",
      title: "Built on Engineering, Driven by Outcomes",
      description:
        "From engineering consultancy and HVAC-R projects to facility operations, industrial automation and agriculture-focused implementation, UESPAK has grown by focusing on practical solutions that perform in real-world environments.",
      isActive: true,
    },
    visionMission: {
      eyebrow: "Our Purpose",
      title: "Vision, Mission and Values",
      visionTitle: "Vision",
      visionDescription:
        "To be a trusted leader in engineering, automation and agriculture solutions across the region.",
      missionTitle: "Mission",
      missionDescription:
        "Deliver practical, high-quality and future-ready solutions through technical excellence and disciplined execution.",
      valuesTitle: "Values",
      valuesDescription:
        "Integrity, safety, quality, innovation and client-focused delivery guide every UESPAK engagement.",
      values: [
        {
          title: "Integrity",
          description:
            "Honest collaboration, transparent reporting and accountable execution on every project.",
        },
        {
          title: "Safety & Quality",
          description:
            "Engineering standards, safety culture and quality controls embedded across every phase.",
        },
        {
          title: "Innovation",
          description:
            "Modern automation, sustainable engineering and continuous improvement built into delivery.",
        },
        {
          title: "Client Focus",
          description:
            "Tailored, sector-aware solutions that solve real operational challenges for clients.",
        },
      ],
      isActive: true,
    },
    capabilities: {
      eyebrow: "Capabilities",
      title: "What We Do",
      description:
        "An integrated capability set across engineering services, facility systems, industrial automation and sustainable agriculture.",
      items: [
        {
          title: "HVAC-R & Environmental Control",
          description:
            "Design, supply and maintenance of HVAC-R systems for commercial, industrial, healthcare and pharmaceutical environments.",
        },
        {
          title: "Facility Management",
          description:
            "Operations and maintenance support to keep facility systems reliable, efficient and compliant.",
        },
        {
          title: "Electrical & Mechanical Engineering",
          description:
            "Engineering services covering electrical systems, mechanical design, MEP coordination and project planning.",
        },
        {
          title: "Industrial Automation & Controls",
          description:
            "Automation, instrumentation, PLC, HMI and control system support for modern industrial operations.",
        },
        {
          title: "Agriculture Solutions",
          description:
            "Agricultural training, regenerative practices and sustainable implementation for farms and agribusiness.",
        },
        {
          title: "Project Execution",
          description:
            "End-to-end engineering project delivery with structured planning, execution and handover.",
        },
      ],
      isActive: true,
    },
    whyChoose: {
      eyebrow: "Why UESPAK",
      title: "Why Clients Choose UESPAK",
      description:
        "A trusted delivery partner for engineering precision, structured execution and practical outcomes.",
      items: [
        {
          title: "Certified Engineering Expertise",
          description: "Multi-disciplinary engineers with sector experience.",
        },
        {
          title: "Multi-Sector Coverage",
          description: "Healthcare, pharma, industrial, commercial, agriculture.",
        },
        {
          title: "Reliable Execution",
          description: "Structured planning and disciplined site delivery.",
        },
        {
          title: "End-to-End Support",
          description: "Design, supply, install, operate and maintain.",
        },
        {
          title: "Modern Automation",
          description: "PLC, HMI, BMS, instrumentation and control systems.",
        },
        {
          title: "Sustainable Practices",
          description: "Energy efficiency and sustainable agriculture focus.",
        },
      ],
      isActive: true,
    },
    cta: {
      eyebrow: "Work With UESPAK",
      title: "Let's plan your next engineering project together.",
      description:
        "Share your requirements and our team will get back with the right approach and scope.",
      buttonText: "Contact Us",
      buttonUrl: "/contact-us",
      isActive: true,
    },
  },
  seo: {
    metaTitle: PAGE_SEO_FALLBACKS.about.title,
    metaDescription: PAGE_SEO_FALLBACKS.about.description,
    keywords: [
      "About UESPAK",
      "Engineering company Pakistan",
      "HVAC-R services",
      "Industrial automation",
      "Facility management",
      "Agriculture solutions",
    ],
    schemaType: PAGE_SEO_FALLBACKS.about.schemaType,
    robots: { index: true, follow: true },
  },
};

export const DEFAULT_CAREERS_PAGE: CareersPageContent = {
  pageKey: "careers",
  title: "Careers at UESPAK",
  slug: "/careers",
  isActive: true,
  hero: {
    eyebrow: "Careers",
    title: "Join the UESPAK Team",
    description:
      "We are building a multidisciplinary team across engineering, facility systems, industrial automation and agriculture. Explore what it's like to work with UESPAK.",
    primaryButtonText: "View Openings",
    primaryButtonUrl: "#apply",
    secondaryButtonText: "Meet The Team",
    secondaryButtonUrl: "#team",
  },
  sections: {
    intro: {
      eyebrow: "Why UESPAK",
      title: "A Team Focused on Engineering & Real Outcomes",
      description:
        "At UESPAK, careers are built around real engineering work — across HVAC-R, automation, facility systems and agriculture-focused projects. We invest in people who care about quality, safety and disciplined execution.",
      isActive: true,
    },
    whyWork: {
      eyebrow: "Why Work With Us",
      title: "What Makes a UESPAK Career Different",
      description:
        "Practical engineering exposure, structured learning paths and direct involvement in delivering meaningful projects.",
      items: [
        {
          title: "Real Project Exposure",
          description:
            "Work on engineering, automation and facility projects across multiple industries.",
        },
        {
          title: "Technical Growth",
          description:
            "Hands-on experience with modern automation, HVAC-R and facility management systems.",
        },
        {
          title: "Quality Culture",
          description:
            "Safety, standards and quality control are central to how we operate.",
        },
        {
          title: "Supportive Team",
          description:
            "Work alongside experienced engineers, specialists and project leads.",
        },
      ],
      isActive: true,
    },
    culture: {
      eyebrow: "Our Culture",
      title: "Values That Guide Our Team",
      description:
        "Engineering integrity, accountability and a focus on client outcomes form the foundation of how we work.",
      values: [
        {
          title: "Integrity",
          description:
            "We operate transparently and stand behind the quality of our work.",
        },
        {
          title: "Safety First",
          description:
            "Safe practices on site and in design are non-negotiable.",
        },
        {
          title: "Continuous Learning",
          description:
            "We invest in technical skills, certifications and mentorship.",
        },
        {
          title: "Collaboration",
          description:
            "Cross-discipline teamwork is how we deliver complex projects.",
        },
      ],
      isActive: true,
    },
    teamIntro: {
      eyebrow: "Our Team",
      title: "Meet The People Behind UESPAK",
      description:
        "Engineers, designers and specialists driving project performance across UESPAK's service lines.",
      showTeamMembers: true,
      isActive: true,
    },
    applyCTA: {
      eyebrow: "Apply",
      title: "Interested in joining UESPAK?",
      description:
        "Send your resume and a short note about the role you're interested in. We'll get back to you when there's a fit.",
      buttonText: "Email Your Resume",
      email: "career@uespak.com",
      isActive: true,
    },
  },
  seo: {
    metaTitle: PAGE_SEO_FALLBACKS.careers.title,
    metaDescription: PAGE_SEO_FALLBACKS.careers.description,
    keywords: [
      "UESPAK careers",
      "Engineering jobs Pakistan",
      "HVAC-R jobs",
      "Automation jobs",
      "Facility management careers",
    ],
    schemaType: PAGE_SEO_FALLBACKS.careers.schemaType,
    robots: { index: true, follow: true },
  },
};

export const DEFAULT_CONTACT_PAGE: ContactPageContent = {
  pageKey: "contact",
  title: "Contact UESPAK",
  slug: "/contact-us",
  isActive: true,
  hero: {
    eyebrow: "Contact",
    title: "Let's Discuss Your Next Project",
    description:
      "Share your engineering, automation, facility or agriculture project enquiry. Our team will respond within one business day.",
    primaryButtonText: "Send a Message",
    primaryButtonUrl: "#contact-form",
    secondaryButtonText: "View Services",
    secondaryButtonUrl: "/services",
  },
  sections: {
    info: {
      eyebrow: "Get In Touch",
      title: "Reach UESPAK",
      description:
        "Our team is available for project enquiries, service questions and partnership conversations across engineering, automation, facility and agriculture domains.",
      isActive: true,
    },
    form: {
      eyebrow: "Send a Message",
      title: "Tell Us About Your Project",
      description:
        "Use the form below to share your requirements. The more detail you can give, the faster we can route your enquiry to the right team.",
      submitButtonText: "Send Message",
      successMessage:
        "Thank you for your message. Our team will get back to you shortly.",
      serviceOptions: [
        "Engineering Services",
        "HVAC-R Services",
        "Facility Management",
        "Industrial Automation",
        "Agriculture Solutions",
        "General Enquiry",
      ],
      isActive: true,
    },
    map: {
      eyebrow: "Our Location",
      title: "Visit UESPAK",
      description:
        "Find our office location and get directions easily through the embedded map.",
      isActive: true,
    },
    support: {
      eyebrow: "Support",
      title: "Why Clients Reach Out",
      description:
        "Whether you're scoping a new project, planning maintenance or exploring automation upgrades, our team can help.",
      items: [
        {
          title: "Project Enquiries",
          description:
            "New engineering, automation or facility project scoping and proposals.",
        },
        {
          title: "Service & Maintenance",
          description:
            "HVAC-R, electrical, mechanical and facility operations support.",
        },
        {
          title: "Partnerships",
          description:
            "Supplier collaboration and partnership conversations welcome.",
        },
      ],
      isActive: true,
    },
  },
  seo: {
    metaTitle: PAGE_SEO_FALLBACKS.contact.title,
    metaDescription: PAGE_SEO_FALLBACKS.contact.description,
    keywords: [
      "Contact UESPAK",
      "Engineering services Pakistan",
      "HVAC-R contact",
      "Facility management enquiry",
    ],
    schemaType: PAGE_SEO_FALLBACKS.contact.schemaType,
    robots: { index: true, follow: true },
  },
};

export function getDefaultPageContent(
  pageKey: "about"
): AboutPageContent;
export function getDefaultPageContent(
  pageKey: "careers"
): CareersPageContent;
export function getDefaultPageContent(
  pageKey: "contact"
): ContactPageContent;
export function getDefaultPageContent(
  pageKey: "services"
): ServicesPageContent;
export function getDefaultPageContent(
  pageKey: "projects"
): ProjectsPageContent;
export function getDefaultPageContent(
  pageKey: PageKey
):
  | AboutPageContent
  | CareersPageContent
  | ContactPageContent
  | ServicesPageContent
  | ProjectsPageContent;
export function getDefaultPageContent(pageKey: PageKey) {
  switch (pageKey) {
    case "about":
      return structuredClone(DEFAULT_ABOUT_PAGE);
    case "careers":
      return structuredClone(DEFAULT_CAREERS_PAGE);
    case "contact":
      return structuredClone(DEFAULT_CONTACT_PAGE);
    case "services":
      return structuredClone(DEFAULT_SERVICES_PAGE);
    case "projects":
      return structuredClone(DEFAULT_PROJECTS_PAGE);
  }
}

export const DEFAULT_SERVICES_PAGE: ServicesPageContent = {
  pageKey: "services",
  title: "Services Page",
  slug: "/services",
  isActive: true,
  hero: {
    eyebrow: "SERVICES",
    title: "Engineering & Agriculture Services",
    description:
      "Explore UESPAK services across engineering, HVAC-R, facility management, industrial automation and agriculture-focused solutions.",
    overlayOpacity: 0.88,
    primaryButtonText: "Discuss Your Requirements",
    primaryButtonUrl: "/contact-us",
  },
  sections: {
    intro: {
      title: "Our Services",
      description:
        "Professional technical services designed for reliability, efficiency and long-term operational value.",
      showGroupTabs: true,
      isActive: true,
    },
    cta: {
      title: "Need reliable technical support?",
      description:
        "Share your requirements and our team will guide you with the right service approach.",
      buttonText: "Contact Us",
      buttonUrl: "/contact-us",
      isActive: true,
    },
  },
  seo: {
    metaTitle: PAGE_SEO_FALLBACKS.services.title,
    metaDescription: PAGE_SEO_FALLBACKS.services.description,
    keywords: [
      "engineering services Pakistan",
      "HVAC-R",
      "industrial automation",
      "facility management",
      "agriculture services Pakistan",
    ],
    schemaType: PAGE_SEO_FALLBACKS.services.schemaType,
    robots: { index: true, follow: true },
  },
};

export const DEFAULT_PROJECTS_PAGE: ProjectsPageContent = {
  pageKey: "projects",
  title: "Projects Page",
  slug: "/projects",
  isActive: true,
  hero: {
    eyebrow: "PROJECTS",
    title: "Engineering, Agriculture & Automation Projects",
    description:
      "Explore selected UESPAK projects across engineering, agriculture, facility systems and industrial automation.",
    overlayOpacity: 0.88,
    primaryButtonText: "Discuss Your Project",
    primaryButtonUrl: "/contact-us",
  },
  sections: {
    intro: {
      title: "Featured Project Work",
      description:
        "A selection of projects showing UESPAK’s technical support across multiple sectors.",
      showGroupTabs: true,
      isActive: true,
    },
    cta: {
      title: "Planning a technical project?",
      description:
        "Connect with UESPAK to discuss your project requirements and execution support.",
      buttonText: "Contact Us",
      buttonUrl: "/contact-us",
      isActive: true,
    },
  },
  seo: {
    metaTitle: PAGE_SEO_FALLBACKS.projects.title,
    metaDescription: PAGE_SEO_FALLBACKS.projects.description,
    keywords: [
      "engineering projects Pakistan",
      "agriculture projects Pakistan",
      "industrial automation projects",
      "UESPAK projects",
    ],
    schemaType: PAGE_SEO_FALLBACKS.projects.schemaType,
    robots: { index: true, follow: true },
  },
};
