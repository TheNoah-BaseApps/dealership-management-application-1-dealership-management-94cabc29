'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import { DollarSign, Gauge } from 'lucide-react';

export default function VehicleCard({ vehicle, onView }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">{vehicle.color}</p>
          </div>
          <StatusBadge status={vehicle.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="h-4 w-4" />
          <span>${parseFloat(vehicle.price || 0).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Gauge className="h-4 w-4" />
          <span>{parseInt(vehicle.mileage || 0).toLocaleString()} miles</span>
        </div>
        <p className="text-xs text-gray-500">VIN: {vehicle.vin}</p>
        {onView && (
          <Button className="w-full mt-4" onClick={() => onView(vehicle)}>
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}