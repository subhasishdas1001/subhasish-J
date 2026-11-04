import {
  PortfolioSiteData,
  PortfolioProject,
} from '../types/portfolio';
import {
  ORIGINAL_PORTRAIT_IMG,
  ORIGINAL_ZAIKO_IMG,
  ORIGINAL_TOOKENQ_IMG,
} from './extractedAssets';

export const DEFAULT_PORTFOLIO_DATA: PortfolioSiteData = {
  hero: {
    label: 'Web & Software Designer',
    headingPrefix: 'I design websites that make',
    headingHighlight: 'brands',
    headingSuffix: 'stand out.',
    subtitle:
      'Creating modern websites and digital experiences while continuously learning, experimenting and building.',
    portraitImg: ORIGINAL_PORTRAIT_IMG,
    primaryBtnText: 'View My Work →',
    primaryBtnLink: '#work',
    secondaryBtnText: 'Let’s Work Together',
    secondaryBtnLink: '#contact',
    floatingCardTitle: 'Web & Software Designer',
    floatingCardSubtitle: 'Always learning, always building',
    showFloatingCard: true,
  },
  about: {
    label: 'About',
    heading: 'A little about me',
    description:
      'I’m a Web Designer focused on creating modern, clean, and user-friendly websites. I’m continuously learning and improving my skills to build better digital experiences for businesses and individuals.',
    profileImage: ORIGINAL_PORTRAIT_IMG,
    showProfileImage: false,
    highlights: [
      {
        id: 'pt-1',
        title: 'Clean, modern design',
        description: 'Layouts that feel simple and look sharp.',
      },
      {
        id: 'pt-2',
        title: 'User-friendly first',
        description: 'Easy to understand, easy to use on any screen.',
      },
      {
        id: 'pt-3',
        title: 'Always improving',
        description: 'Every project is a chance to learn and do better.',
      },
    ],
  },
  services: [
    {
      id: 'srv-1',
      icon: '▣',
      title: 'Website Design',
      description: 'Modern UI/UX and responsive website design.',
      order: 1,
    },
    {
      id: 'srv-2',
      icon: '⌂',
      title: 'Business Websites',
      description: 'Professional websites for businesses and local brands.',
      order: 2,
    },
    {
      id: 'srv-3',
      icon: '◧',
      title: 'Web Apps & Software',
      description: 'Useful, easy-to-use web tools and platforms.',
      order: 3,
    },
    {
      id: 'srv-4',
      icon: '↻',
      title: 'Website Redesign',
      description: 'Modernizing outdated websites with better UI/UX.',
      order: 4,
    },
  ],
  skills: {
    label: 'Skills',
    heading: 'Areas I work in',
    showCategories: false,
    categories: [
      {
        id: 'cat-core',
        name: 'Design & Web Capabilities',
        skills: [
          'UI/UX Design',
          'Website Design',
          'Responsive Design',
          'Web Applications',
          'Restaurant Websites',
          'Healthcare Software UI',
          'Brand Presentation',
        ],
      },
    ],
  },
  process: {
    label: 'Process',
    heading: 'How I work',
    steps: [
      {
        id: 'step-1',
        number: '01',
        title: 'Understand',
        description: 'Understand the business, audience and goals.',
        order: 1,
      },
      {
        id: 'step-2',
        number: '02',
        title: 'Design',
        description: 'Create the visual direction and UI/UX.',
        order: 2,
      },
      {
        id: 'step-3',
        number: '03',
        title: 'Build',
        description: 'Develop the responsive website.',
        order: 3,
      },
      {
        id: 'step-4',
        number: '04',
        title: 'Improve',
        description: 'Test, refine and keep improving the result.',
        order: 4,
      },
    ],
  },
  contact: {
    heading: 'Have an idea? Let’s build it.',
    description: 'Let’s create something modern, useful and memorable.',
    email: '',
    phone: '8670479101',
    whatsapp: '918670479101',
    buttons: [
      {
        id: 'cbtn-1',
        label: 'Start a Project',
        url: 'https://wa.me/918670479101',
        variant: 'primary',
      },
      {
        id: 'cbtn-2',
        label: 'Contact Me',
        url: 'tel:+918670479101',
        variant: 'ghost',
      },
    ],
  },
  socials: [
    {
      id: 'soc-ig',
      platform: 'instagram',
      name: 'Instagram',
      handle: '@subhasish.02',
      url: 'https://www.instagram.com/subhasish.02/',
      enabled: true,
      order: 1,
    },
    {
      id: 'soc-wa',
      platform: 'whatsapp',
      name: 'WhatsApp',
      handle: '+91 8670479101',
      url: 'https://wa.me/918670479101',
      enabled: false,
      order: 2,
    },
    {
      id: 'soc-fb',
      platform: 'facebook',
      name: 'Facebook',
      handle: 'Subhasish',
      url: '',
      enabled: false,
      order: 3,
    },
    {
      id: 'soc-li',
      platform: 'linkedin',
      name: 'LinkedIn',
      handle: 'Subhasish',
      url: '',
      enabled: false,
      order: 4,
    },
    {
      id: 'soc-gh',
      platform: 'github',
      name: 'GitHub',
      handle: 'subhasish',
      url: '',
      enabled: false,
      order: 5,
    },
    {
      id: 'soc-yt',
      platform: 'youtube',
      name: 'YouTube',
      handle: 'Subhasish',
      url: '',
      enabled: false,
      order: 6,
    },
    {
      id: 'soc-tw',
      platform: 'twitter',
      name: 'X / Twitter',
      handle: '@subhasish',
      url: '',
      enabled: false,
      order: 7,
    },
    {
      id: 'soc-tg',
      platform: 'telegram',
      name: 'Telegram',
      handle: 'Subhasish',
      url: '',
      enabled: false,
      order: 8,
    },
    {
      id: 'soc-be',
      platform: 'behance',
      name: 'Behance',
      handle: 'Subhasish',
      url: '',
      enabled: false,
      order: 9,
    },
    {
      id: 'soc-dr',
      platform: 'dribbble',
      name: 'Dribbble',
      handle: 'Subhasish',
      url: '',
      enabled: false,
      order: 10,
    },
  ],
  appearance: {
    accentLight: '#c2410c',
    accentDark: '#f59e5b',
    bgLight: '#f6f4ef',
    bgDark: '#0e0e0c',
    surfaceLight: '#ffffff',
    surfaceDark: '#171714',
    textLight: '#14130f',
    textDark: '#f3f1ea',
    defaultTheme: 'light',
    logoText: 'Subhasish',
    logoImage: '',
    faviconUrl: '',
    headingFont: 'Fraunces',
    bodyFont: 'Manrope',
    buttonStyle: 'pill',
    sectionSpacing: 'normal',
    borderRadius: 20,
  },
  seo: {
    siteTitle: 'Subhasish — Web Designer & Website Creator',
    metaDescription:
      'Subhasish is a Web Designer creating modern, user-friendly websites, business sites, and web applications. View portfolio projects including Zaiko Foods, TookenQ, and SmartCalc.',
    keywords:
      'Subhasish, Web Designer, Website Designer, UI UX Designer, Business Website, Web Developer, Portfolio, Zaiko Foods, TookenQ, SmartCalc',
    author: 'Subhasish',
    ogTitle: 'Subhasish — Web Designer & Website Creator',
    ogDescription:
      'Modern websites and digital experiences designed to make brands stand out.',
    ogImage: '',
    canonicalUrl: '',
    faviconUrl: '',
    robots: 'index,follow',
    pages: [
      {
        id: 'page-home',
        pageName: 'Homepage',
        path: '/',
        title: 'Subhasish — Web Designer & Website Creator',
        description:
          'Subhasish is a Web Designer creating modern, user-friendly websites, business sites, and web applications.',
        keywords:
          'Subhasish, Web Designer, Website Designer, UI UX Designer, Portfolio',
        ogImage: '',
      },
    ],
  },
  navigation: [
    { id: 'nav-about', label: 'About', url: '#about', visible: true, order: 1 },
    {
      id: 'nav-services',
      label: 'Services',
      url: '#services',
      visible: true,
      order: 2,
    },
    { id: 'nav-work', label: 'Work', url: '#work', visible: true, order: 3 },
    {
      id: 'nav-process',
      label: 'Process',
      url: '#process',
      visible: true,
      order: 4,
    },
    {
      id: 'nav-contact',
      label: 'Contact',
      url: '#contact',
      visible: true,
      order: 5,
    },
  ],
  footer: {
    brandName: 'Subhasish',
    logoImage: '',
    tagline: 'Web Designer & Digital Creator',
    description: 'Subhasish — Web Designer & Digital Creator',
    copyrightText: '© 2026 Subhasish. All rights reserved.',
    showSocialIcons: true,
    links: [
      { id: 'fnav-work', label: 'Work', url: '#work', visible: true, order: 1 },
      {
        id: 'fnav-services',
        label: 'Services',
        url: '#services',
        visible: true,
        order: 2,
      },
      {
        id: 'fnav-contact',
        label: 'Contact',
        url: '#contact',
        visible: true,
        order: 3,
      },
    ],
  },
  updatedAt: '2026-01-01T00:00:00.000Z',
  updatedBy: 'admin',
};

export const DEFAULT_PROJECTS: PortfolioProject[] = [
  {
    id: 'zaiko-foods',
    title: 'Zaiko Foods',
    cat: 'Restaurant & Food Service Website',
    shortDesc:
      'A modern food and restaurant website designed with an attractive visual layout, menu presentation, and mobile-friendly ordering experience.',
    desc: 'Zaiko Foods is a modern restaurant and food brand website designed to showcase food items clearly, build customer trust, and create an engaging browsing experience across mobile and desktop devices.',
    img: ORIGINAL_ZAIKO_IMG,
    gallery: ORIGINAL_ZAIKO_IMG ? [ORIGINAL_ZAIKO_IMG] : [],
    url: 'https://www.zaikofoods.com/',
    tags: [
      'Restaurant Website',
      'UI/UX Design',
      'Menu Showcase',
      'Responsive Design',
      'Brand Presentation',
    ],
    year: '2026',
    featured: true,
    order: 1,
    status: 'published',
    seoTitle: 'Zaiko Foods — Restaurant & Food Service Website | Subhasish',
    seoDesc:
      'Zaiko Foods is a modern restaurant and food brand website designed to showcase food items clearly and create an engaging browsing experience.',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tookenq',
    title: 'TookenQ',
    cat: 'Doctor & Patient Appointment Platform',
    shortDesc:
      'A digital healthcare appointment and queue management platform connecting doctors and patients with a simple, clean user experience.',
    desc: 'TookenQ is a healthcare appointment and token management website designed to simplify patient booking, doctor scheduling, and clinic queue management through an intuitive digital interface.',
    img: ORIGINAL_TOOKENQ_IMG,
    gallery: ORIGINAL_TOOKENQ_IMG ? [ORIGINAL_TOOKENQ_IMG] : [],
    url: 'https://www.tookenq.in/',
    tags: [
      'Healthcare Software',
      'Appointment Booking',
      'Patient Management',
      'Doctor Dashboard',
      'UI/UX Design',
      'Responsive Web Design',
    ],
    year: '2026',
    featured: true,
    order: 2,
    status: 'published',
    seoTitle: 'TookenQ — Doctor & Patient Appointment Platform | Subhasish',
    seoDesc:
      'TookenQ is a digital healthcare appointment and token management platform connecting doctors and patients.',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'smartcalc',
    title: 'SmartCalc',
    cat: 'All-in-One Calculator Platform',
    shortDesc:
      'A fast, clean multi-calculator web application built for everyday calculations, financial tools, and utility problem-solving.',
    desc: 'SmartCalc is an all-in-one online calculator platform offering multiple calculation tools in a clean, fast, and easy-to-use interface designed for students, professionals, and daily users.',
    img: '',
    gallery: [],
    url: 'https://smartcalc-all-in-one-calculator.ai.studio/',
    tags: [
      'Web Application',
      'UI/UX Design',
      'Calculator Tools',
      'User-Friendly Interface',
      'Responsive Design',
      'Utility Platform',
    ],
    year: '2026',
    featured: true,
    order: 3,
    status: 'published',
    seoTitle: 'SmartCalc — All-in-One Calculator Platform | Subhasish',
    seoDesc:
      'SmartCalc is an all-in-one online calculator platform offering multiple calculation tools in a clean, fast interface.',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'next',
    title: 'Next project',
    cat: 'Coming soon',
    shortDesc: 'A new project is on the way. Check back soon.',
    desc: 'A new project is on the way. Check back soon.',
    img: '',
    gallery: [],
    url: '',
    tags: [],
    year: '2026',
    featured: true,
    order: 4,
    status: 'published',
    seoTitle: 'Next project — Coming Soon | Subhasish',
    seoDesc: 'A new project is on the way. Check back soon.',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

export interface SerializedSiteConfigDoc {
  heroJson: string;
  aboutJson: string;
  servicesJson: string;
  skillsJson: string;
  processJson: string;
  contactJson: string;
  socialJson: string;
  appearanceJson: string;
  seoJson: string;
  navigationJson: string;
  footerJson: string;
  updatedAt: string;
  updatedBy: string;
}

export function serializeSiteData(
  data: PortfolioSiteData
): SerializedSiteConfigDoc {
  return {
    heroJson: JSON.stringify(data.hero),
    aboutJson: JSON.stringify(data.about),
    servicesJson: JSON.stringify(data.services),
    skillsJson: JSON.stringify(data.skills),
    processJson: JSON.stringify(data.process),
    contactJson: JSON.stringify(data.contact),
    socialJson: JSON.stringify(data.socials),
    appearanceJson: JSON.stringify(data.appearance),
    seoJson: JSON.stringify(data.seo),
    navigationJson: JSON.stringify(data.navigation),
    footerJson: JSON.stringify(data.footer),
    updatedAt: data.updatedAt || new Date().toISOString(),
    updatedBy: data.updatedBy || 'admin',
  };
}

export function deserializeSiteData(
  raw: Record<string, unknown> | undefined
): PortfolioSiteData {
  if (!raw) return DEFAULT_PORTFOLIO_DATA;
  const safeParse = <T>(val: unknown, fallback: T): T => {
    if (typeof val !== 'string' || !val) return fallback;
    try {
      return { ...fallback, ...JSON.parse(val) };
    } catch {
      return fallback;
    }
  };
  const safeParseArray = <T>(val: unknown, fallback: T[]): T[] => {
    if (typeof val !== 'string' || !val) return fallback;
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  };

  return {
    hero: safeParse(raw.heroJson, DEFAULT_PORTFOLIO_DATA.hero),
    about: safeParse(raw.aboutJson, DEFAULT_PORTFOLIO_DATA.about),
    services: safeParseArray(raw.servicesJson, DEFAULT_PORTFOLIO_DATA.services),
    skills: safeParse(raw.skillsJson, DEFAULT_PORTFOLIO_DATA.skills),
    process: safeParse(raw.processJson, DEFAULT_PORTFOLIO_DATA.process),
    contact: safeParse(raw.contactJson, DEFAULT_PORTFOLIO_DATA.contact),
    socials: safeParseArray(raw.socialJson, DEFAULT_PORTFOLIO_DATA.socials),
    appearance: safeParse(
      raw.appearanceJson,
      DEFAULT_PORTFOLIO_DATA.appearance
    ),
    seo: safeParse(raw.seoJson, DEFAULT_PORTFOLIO_DATA.seo),
    navigation: safeParseArray(
      raw.navigationJson,
      DEFAULT_PORTFOLIO_DATA.navigation
    ),
    footer: safeParse(raw.footerJson, DEFAULT_PORTFOLIO_DATA.footer),
    updatedAt:
      typeof raw.updatedAt === 'string'
        ? raw.updatedAt
        : DEFAULT_PORTFOLIO_DATA.updatedAt,
    updatedBy:
      typeof raw.updatedBy === 'string'
        ? raw.updatedBy
        : DEFAULT_PORTFOLIO_DATA.updatedBy,
  };
}
