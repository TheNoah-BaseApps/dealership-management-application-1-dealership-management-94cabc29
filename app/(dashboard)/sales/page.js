'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import DataTable from '@/components/common/DataTable';
import SearchBar from '@/components/common/SearchBar';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/sales', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch sales');
      }

      const data = await res.json();
      if (data.success) {
        setSales(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to load sales');
      }
    } catch (err) {
      console.error('Fetch sales error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this sale?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/sales/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to delete sale');
      }

      fetchSales();
      toast.success('Sale deleted successfully');
    } catch (err) {
      console.error('Delete sale error:', err);
      toast.error(err.message);
    }
  };

  const columns = [
    { 
      key: 'customer_name', 
      label: 'Customer', 
      sortable: true,
      render: (value, row) => row.customer_name || 'N/A'
    },
    { 
      key: 'vehicle_info', 
      label: 'Vehicle',
      render: (value, row) => row.vehicle_info || 'N/A'
    },
    { 
      key: 'sale_price', 
      label: 'Sale Price', 
      sortable: true,
      render: (value) => `$${parseFloat(value || 0).toLocaleString()}`
    },
    { key: 'financing_type', label: 'Financing', sortable: true },
    { key: 'sale_status', label: 'Status', sortable: true },
    { 
      key: 'sale_date', 
      label: 'Sale Date', 
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
  ];

  const filteredSales = sales.filter(sale => 
    sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.vehicle_info?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.sale_status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600 mt-1">Manage sales transactions and deliveries</p>
        </div>
        <Button onClick={() => router.push('/sales/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Sale
        </Button>
      </div>

      <SearchBar 
        value={searchTerm} 
        onChange={setSearchTerm} 
        placeholder="Search sales by customer, vehicle, or status..." 
      />

      <DataTable 
        columns={columns} 
        data={filteredSales}
        onView={(sale) => router.push(`/sales/${sale.id}`)}
        onDelete={handleDelete}
      />
    </div>
  );
}