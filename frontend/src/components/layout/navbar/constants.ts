export const NAVBAR_LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English',    flag: '🇬🇧' },
] as const;

export type NavbarLang = typeof NAVBAR_LANGUAGES[number]['code'];
export type NavbarVariant = 'overlay' | 'solid';
