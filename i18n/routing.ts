import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: 'never', // Don't use locale prefix in URLs - store in cookies instead
});
