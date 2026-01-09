'use client';

import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { ROLE_LABELS } from '@/types';
import { UserRole } from '@prisma/client';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const t = useTranslations('pages.settings');
  const tSettings = useTranslations('settings');
  const tForms = useTranslations('forms');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      <div className="grid gap-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profileTitle')}</CardTitle>
            <CardDescription>{t('profileDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">{tForms('name')}</Label>
                <p className="font-medium">{session?.user?.name || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{tForms('email')}</Label>
                <p className="font-medium">{session?.user?.email || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{tForms('role')}</Label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {ROLE_LABELS[session?.user?.role as UserRole] || session?.user?.role || '-'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('appearanceTitle')}</CardTitle>
            <CardDescription>{t('appearanceDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">{t('darkMode')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('darkModeDesc')}
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('aboutTitle')}</CardTitle>
            <CardDescription>{t('aboutDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">{tSettings('about')}</Label>
                <p className="font-medium">{t('applicationName')}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{tSettings('version')}</Label>
                <p className="font-medium">{t('versionInfo')}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{tSettings('poweredBy')}</Label>
                <p className="font-medium">TC Data</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Build</Label>
                <p className="font-medium">{t('buildInfo')}</p>
              </div>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">
              {t('copyright')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
