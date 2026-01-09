'use client';

import { PageHeader } from '@/components/shared/page-header';
import { ComingSoon } from '@/components/shared/coming-soon';

export default function DemandAnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Demand Analysis"
        description="Analyze demand patterns and trends"
      />
      <ComingSoon
        title="Demand Analysis"
        description="Advanced demand forecasting and pattern analysis coming soon"
      />
    </div>
  );
}
