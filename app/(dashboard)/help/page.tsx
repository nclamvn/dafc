'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import {
  BookOpen,
  MessageCircle,
  Mail,
  ExternalLink,
  Keyboard,
  HelpCircle,
} from 'lucide-react';

export default function HelpPage() {
  const t = useTranslations('common');

  const helpSections = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of the OTB Platform',
      icon: BookOpen,
      items: [
        'Navigate using the sidebar menu',
        'View dashboards and analytics',
        'Create and manage budgets',
        'Submit proposals for approval',
      ],
    },
    {
      title: 'Keyboard Shortcuts',
      description: 'Quick navigation shortcuts',
      icon: Keyboard,
      items: [
        '⌘K / Ctrl+K - Open search',
        '⌘B / Ctrl+B - Toggle sidebar',
        'Esc - Close modals',
        '? - Show shortcuts',
      ],
    },
    {
      title: 'Support',
      description: 'Get help when you need it',
      icon: MessageCircle,
      items: [
        'Use AI Assistant for quick answers',
        'Contact your admin for access issues',
        'Report bugs via the feedback form',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('help')}
        description="Documentation and support resources"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {helpSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <section.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </div>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {section.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <CardTitle>Need More Help?</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <a
            href="mailto:support@dafc.com"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <Mail className="h-4 w-4" />
            support@dafc.com
          </a>
          <a
            href="https://github.com/nclamvn/dafc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="h-4 w-4" />
            Documentation
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
