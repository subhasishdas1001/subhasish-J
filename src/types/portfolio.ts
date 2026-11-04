export interface HeroConfig {
  label: string;
  headingPrefix: string;
  headingHighlight: string;
  headingSuffix: string;
  subtitle: string;
  portraitImg: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText: string;
  secondaryBtnLink: string;
  floatingCardTitle: string;
  floatingCardSubtitle: string;
  showFloatingCard: boolean;
}

export interface AboutHighlight {
  id: string;
  title: string;
  description: string;
}

export interface AboutConfig {
  label: string;
  heading: string;
  description: string;
  profileImage: string;
  showProfileImage: boolean;
  highlights: AboutHighlight[];
}

export interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export interface SkillsConfig {
  label: string;
  heading: string;
  showCategories: boolean;
  categories: SkillCategory[];
}

export interface ProcessStep {
  id: string;
  number: string;
  title: string;
  description: string;
  order: number;
}

export interface ProcessConfig {
  label: string;
  heading: string;
  steps: ProcessStep[];
}

export interface ContactButton {
  id: string;
  label: string;
  url: string;
  variant: 'primary' | 'ghost';
}

export interface ContactConfig {
  heading: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  buttons: ContactButton[];
}

export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'youtube'
  | 'github'
  | 'twitter'
  | 'whatsapp'
  | 'telegram'
  | 'behance'
  | 'dribbble'
  | 'custom';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  name: string;
  handle: string;
  url: string;
  enabled: boolean;
  order: number;
}

export interface AppearanceConfig {
  accentLight: string;
  accentDark: string;
  bgLight: string;
  bgDark: string;
  surfaceLight: string;
  surfaceDark: string;
  textLight: string;
  textDark: string;
  defaultTheme: 'light' | 'dark';
  logoText: string;
  logoImage: string;
  faviconUrl: string;
  headingFont: string;
  bodyFont: string;
  buttonStyle: 'pill' | 'rounded' | 'sharp';
  sectionSpacing: 'compact' | 'normal' | 'spacious';
  borderRadius: number;
}

export interface PageSeoConfig {
  id: string;
  pageName: string;
  path: string;
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
}

export interface SeoConfig {
  siteTitle: string;
  metaDescription: string;
  keywords: string;
  author: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  faviconUrl: string;
  robots: string;
  pages: PageSeoConfig[];
}

export interface NavItem {
  id: string;
  label: string;
  url: string;
  visible: boolean;
  order: number;
}

export interface FooterConfig {
  brandName: string;
  logoImage: string;
  tagline: string;
  description: string;
  copyrightText: string;
  showSocialIcons: boolean;
  links: NavItem[];
}

export interface PortfolioSiteData {
  hero: HeroConfig;
  about: AboutConfig;
  services: ServiceItem[];
  skills: SkillsConfig;
  process: ProcessConfig;
  contact: ContactConfig;
  socials: SocialLink[];
  appearance: AppearanceConfig;
  seo: SeoConfig;
  navigation: NavItem[];
  footer: FooterConfig;
  updatedAt: string;
  updatedBy: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  cat: string;
  shortDesc: string;
  desc: string;
  img: string;
  gallery: string[];
  url: string;
  tags: string[];
  year: string;
  featured: boolean;
  order: number;
  status: 'published' | 'draft';
  seoTitle: string;
  seoDesc: string;
  updatedAt: string;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  section: string;
  actorEmail: string;
  createdAt: string;
}
