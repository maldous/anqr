/**
 * Types for static page content
 * Used by StaticPage component and translation files
 *
 * LINKING STRATEGY:
 * - Internal links use syntax: [[/path|Label]] or [[/path?param=value|Label]]
 * - Generator links preserve locale: [[/?lang=${lang}|Label]] or [[/?preset=foo&lang=${lang}|Label]]
 * - Section anchors: [[/guide#section-5|See guide section]]
 * - The StaticPage component parses these and renders as proper <a> tags
 */

/** Link types for categorization and styling */
export type LinkType = 'generator' | 'guide' | 'learn' | 'example' | 'gallery' | 'external';

/** A contextual link within static content */
export type PageLink = {
  href: string; // URL path, can include ${lang} placeholder
  label: string; // Display text
  type?: LinkType; // Optional categorization
};

/** Image within a section */
export type PageImage = {
  src: string; // Path relative to /public, e.g., '/images/learn/campaign-before.png'
  alt: string; // Alt text for accessibility
  caption?: string; // Optional caption below image
};

export type PageSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  /** Optional image(s) for the section */
  images?: PageImage[];
  /** Contextual links shown after the section content */
  links?: PageLink[];
};

export type PageDefinition = {
  title: string;
  description: string;
  lastUpdated?: string;
  /** Breadcrumb path, e.g., ['Learn', 'Guides'] */
  breadcrumb?: string[];
  /** Primary CTA links shown prominently */
  primaryLinks?: PageLink[];
  sections: PageSection[];
  /** Related content links shown at bottom */
  relatedLinks?: PageLink[];
};

export type StaticPageType =
  | 'about'
  | 'guide'
  | 'learn'
  | 'examples'
  | 'privacy'
  | 'terms'
  | 'contact'
  | 'translate';

// Note: LAST_UPDATED and CONTACT_EMAIL are now in constants.ts to avoid circular imports
// Do NOT re-export them here - it creates circular dependencies with the page files
