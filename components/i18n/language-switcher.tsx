'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  locale?: string;
  variant?: 'default' | 'compact' | 'icon';
}

export function LanguageSwitcher({ locale: propLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const intlLocale = useLocale();

  const currentLocale = (propLocale || intlLocale) as Locale;
  const nextLocale: Locale = currentLocale === 'vi' ? 'en' : 'vi';

  const toggleLocale = () => {
    // Set cookie for locale preference
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className={cn(
        'px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all',
        'bg-muted hover:bg-muted/80 text-foreground',
        isPending && 'opacity-50 cursor-wait'
      )}
    >
      {currentLocale === 'vi' ? 'VN' : 'EN'}
    </button>
  );
}
