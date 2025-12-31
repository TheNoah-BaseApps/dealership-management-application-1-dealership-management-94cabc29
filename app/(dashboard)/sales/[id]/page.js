'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/common/StatusBadge';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SaleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchSale();
    }
  }, [params.id]);

  const fetchSale = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/sales/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch sale');
      }

      const data = await res.json();
      if (data.success) {
        setSale(data.data);
      } else {
        throw new Error(data.error || 'Failed to load sale');
      }
    } catch (err) {
      console.error('Fetch sale error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this sale?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/sales/${params.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to delete sale');
      }

      toast.success('Sale deleted successfully');
      router.push('/sales');
    } catch (err) {
      console.error('Delete sale error:', err);
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
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

  if (!sale) {
    return (
      <Alert>
        <AlertDescription>Sale not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/sales')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sale #{sale.id.slice(0, 8)}</h1>
            <p className="text-gray-600 mt-1">Sale Transaction Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sale Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <StatusBadge status={sale.sale_status} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sale Date</p>
                <p className="font-medium">
                  {sale.sale_date ? new Date(sale.sale_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivery Date</p>
                <p className="font-medium">
                  {sale.delivery_date ? new Date(sale.delivery_date).toLocaleDateString() : 'Not scheduled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <p className="text-sm text-gray-500">Customer Name</p>
                <p className="font-medium">{sale.customer_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{sale.customer_email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{sale.customer_phone || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <p className="text-sm text-gray-500">Vehicle</p>
                <p className="font-medium">{sale.vehicle_info || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">VIN</p>
                <p className="font-medium">{sale.vehicle_vin || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <p className="text-sm text-gray-500">Sale Price</p>
                <p className="font-medium text-lg">
                  ${parseFloat(sale.sale_price || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Financing Type</p>
                <p className="font-medium">{sale.financing_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trade-In Value</p>
                <p className="font-medium">
                  {sale.trade_in_value ? `$${parseFloat(sale.trade_in_value).toLocaleString()}` : 'No trade-in'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Warranty Package</p>
                <p className="font-medium">{sale.warranty_package || 'None'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}