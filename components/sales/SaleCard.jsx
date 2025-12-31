'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import { DollarSign, Car, Calendar } from 'lucide-react';

export default function SaleCard({ sale, onView }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{sale.customer_name}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{sale.vehicle_info}</p>
          </div>
          <StatusBadge status={sale.sale_status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="h-4 w-4" />
          <span>${parseFloat(sale.sale_price || 0).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Car className="h-4 w-4" />
          <span>{sale.financing_type}</span>
        </div>
        {sale.delivery_date && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Delivery: {new Date(sale.delivery_date).toLocaleDateString()}</span>
          </div>
        )}
        <Button className="w-full mt-4" onClick={() => onView(sale)}>
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}