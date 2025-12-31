'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import LeadSourceChart from '@/components/analytics/LeadSourceChart';
import SalesPerformanceChart from '@/components/analytics/SalesPerformanceChart';

export default function AnalyticsPage() {
  const [leadAnalytics, setLeadAnalytics] = useState(null);
  const [salesAnalytics, setSalesAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [leadRes, salesRes] = await Promise.all([
        fetch('/api/analytics/leads', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/analytics/sales', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!leadRes.ok || !salesRes.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const [leadData, salesData] = await Promise.all([
        leadRes.json(),
        salesRes.json()
      ]);

      if (leadData.success) setLeadAnalytics(leadData.data);
      if (salesData.success) setSalesAnalytics(salesData.data);
    } catch (err) {
      console.error('Fetch analytics error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
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
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">Track performance metrics and insights</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Source Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadSourceChart data={leadAnalytics} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesPerformanceChart data={salesAnalytics} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}