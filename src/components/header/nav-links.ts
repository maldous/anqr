import type { HeaderPage } from './header-resolve-page';
import {
  BookOpen,
  FileText,
  Globe,
  Images,
  Info,
  Lightbulb,
  Mail,
  QrCode,
  ScanLine,
  Shield,
  Sparkles,
} from 'lucide-react';

export const NAV_LINKS: Array<{
  href: string;
  labelKey: string;
  defaultLabel: string;
  page: HeaderPage;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
  iubendaEmbed?: boolean;
}> = [
  { href: '/', labelKey: 'nav.generator', defaultLabel: 'Generator', page: 'editor', icon: QrCode },
  {
    href: '/analyze',
    labelKey: 'nav.analyze',
    defaultLabel: 'Analyze',
    page: 'analyze',
    icon: ScanLine,
  },
  {
    href: '/gallery',
    labelKey: 'nav.gallery',
    defaultLabel: 'Gallery',
    page: 'gallery',
    icon: Images,
  },
  { href: '/guide', labelKey: 'nav.guide', defaultLabel: 'Guide', page: 'guide', icon: BookOpen },
  { href: '/learn', labelKey: 'nav.learn', defaultLabel: 'Learn', page: 'learn', icon: Lightbulb },
  {
    href: '/examples',
    labelKey: 'nav.examples',
    defaultLabel: 'Examples',
    page: 'examples',
    icon: Sparkles,
  },
  { href: '/about', labelKey: 'nav.about', defaultLabel: 'About', page: 'about', icon: Info },
  {
    href: '/privacy',
    labelKey: 'nav.privacy',
    defaultLabel: 'Privacy',
    page: 'privacy',
    icon: Shield,
  },
  { href: '/terms', labelKey: 'nav.terms', defaultLabel: 'Terms', page: 'terms', icon: FileText },
  {
    href: '/translate',
    labelKey: 'nav.translate',
    defaultLabel: 'Translate',
    page: 'translate',
    icon: Globe,
  },
  {
    href: '/contact',
    labelKey: 'nav.contact',
    defaultLabel: 'Contact',
    page: 'contact',
    icon: Mail,
  },
];
