'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { MessageSquare, Package, Users, TrendingUp, DollarSign, Car } from 'lucide-react';
import Link from 'next/link';
import DashboardWidgets from '@/components/analytics/DashboardWidgets';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workflowCounts, setWorkflowCounts] = useState({
    leads: 0,
    sales: 0,
    customers: 0,
    vehicles: 0,
    engagements: 0,
    inventory: 0
  });

  useEffect(() => {
    fetchDashboardMetrics();
    fetchWorkflowCounts();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/analytics/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch dashboard metrics');
      }

      const data = await res.json();
      if (data.success) {
        setMetrics(data.data);
      } else {
        throw new Error(data.error || 'Failed to load metrics');
      }
    } catch (err) {
      console.error('Dashboard metrics error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch customer engagements count
      const engagementsRes = await fetch('/api/customer-engagements?limit=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (engagementsRes.ok) {
        const engagementsData = await engagementsRes.json();
        if (engagementsData.success) {
          setWorkflowCounts(prev => ({ ...prev, engagements: engagementsData.total || 0 }));
        }
      }

      // Fetch stock inventory count
      const inventoryRes = await fetch('/api/stock-inventory?limit=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json();
        if (inventoryData.success) {
          setWorkflowCounts(prev => ({ ...prev, inventory: inventoryData.total || 0 }));
        }
      }

      // Fetch other counts if available
      const leadsRes = await fetch('/api/leads?limit=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        if (leadsData.success) {
          setWorkflowCounts(prev => ({ ...prev, leads: leadsData.total || 0 }));
        }
      }

      const salesRes = await fetch('/api/sales?limit=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        if (salesData.success) {
          setWorkflowCounts(prev => ({ ...prev, sales: salesData.total || 0 }));
        }
      }

      const customersRes = await fetch('/api/customers?limit=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        if (customersData.success) {
          setWorkflowCounts(prev => ({ ...prev, customers: customersData.total || 0 }));
        }
      }

      const vehiclesRes = await fetch('/api/vehicles?limit=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json();
        if (vehiclesData.success) {
          setWorkflowCounts(prev => ({ ...prev, vehicles: vehiclesData.total || 0 }));
        }
      }
    } catch (err) {
      console.error('Error fetching workflow counts:', err);
    }
  };

  const workflowCards = [
    {
      title: 'Leads',
      description: 'Manage and track potential customers',
      icon: Users,
      href: '/leads',
      count: workflowCounts.leads,
      color: 'text-blue-600'
    },
    {
      title: 'Sales',
      description: 'Track deals and revenue',
      icon: DollarSign,
      href: '/sales',
      count: workflowCounts.sales,
      color: 'text-green-600'
    },
    {
      title: 'Customers',
      description: 'View and manage customer relationships',
      icon: Users,
      href: '/customers',
      count: workflowCounts.customers,
      color: 'text-purple-600'
    },
    {
      title: 'Vehicles',
      description: 'Browse and manage vehicle listings',
      icon: Car,
      href: '/vehicles',
      count: workflowCounts.vehicles,
      color: 'text-orange-600'
    },
    {
      title: 'Customer Engagements',
      description: 'Track customer interactions and campaigns',
      icon: MessageSquare,
      href: '/customer-engagements',
      count: workflowCounts.engagements,
      color: 'text-cyan-600'
    },
    {
      title: 'Stock Inventory',
      description: 'Manage vehicle stock and inventory',
      icon: Package,
      href: '/stock-inventory',
      count: workflowCounts.inventory,
      color: 'text-indigo-600'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your dealership overview.</p>
      </div>

      {/* Workflow Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflowCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg bg-gray-100 ${card.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </div>
                  {card.count > 0 && (
                    <div className="ml-4">
                      <span className="text-2xl font-bold text-gray-900">{card.count}</span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <DashboardWidgets metrics={metrics} />
    </div>
  );
}