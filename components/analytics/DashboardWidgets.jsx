'use client';

import StatCard from '@/components/common/StatCard';
import { Users, DollarSign, TrendingUp, Clock } from 'lucide-react';

export default function DashboardWidgets({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Leads"
        value={metrics.totalLeads || 0}
        icon={Users}
        change={`${metrics.leadsChange || 0}% from last month`}
        trend={metrics.leadsChange > 0 ? 'up' : 'down'}
      />
      <StatCard
        title="Conversion Rate"
        value={`${metrics.conversionRate || 0}%`}
        icon={TrendingUp}
        change={`${metrics.conversionChange || 0}% from last month`}
        trend={metrics.conversionChange > 0 ? 'up' : 'down'}
      />
      <StatCard
        title="Sales This Month"
        value={`$${parseFloat(metrics.salesThisMonth || 0).toLocaleString()}`}
        icon={DollarSign}
        change={`${metrics.salesChange || 0}% from last month`}
        trend={metrics.salesChange > 0 ? 'up' : 'down'}
      />
      <StatCard
        title="Pending Deliveries"
        value={metrics.pendingDeliveries || 0}
        icon={Clock}
      />
    </div>
  );
}