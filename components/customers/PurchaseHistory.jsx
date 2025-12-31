'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function PurchaseHistory({ customerId }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, [customerId]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/sales?customer_id=${customerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPurchases(data.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">
        No purchase history
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {purchases.map((purchase) => (
        <div key={purchase.id} className="border rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-medium">{purchase.vehicle_info}</p>
              <p className="text-sm text-gray-500">
                {purchase.sale_date ? new Date(purchase.sale_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <Badge variant="outline">{purchase.sale_status}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{purchase.financing_type}</span>
            <span className="font-semibold">
              ${parseFloat(purchase.sale_price || 0).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}