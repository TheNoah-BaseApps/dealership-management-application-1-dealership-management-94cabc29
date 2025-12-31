'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function VehicleSelectionStep({ formData, setFormData }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (formData.vehicle_id && vehicles.length > 0) {
      const vehicle = vehicles.find(v => v.id === formData.vehicle_id);
      if (vehicle) {
        setSelectedVehicle(vehicle);
        setFormData(prev => ({ ...prev, sale_price: vehicle.price }));
      }
    }
  }, [formData.vehicle_id, vehicles]);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vehicles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const availableVehicles = (data.data || []).filter(v => v.status === 'available');
          setVehicles(availableVehicles);
        }
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-64" />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Vehicle</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle_id">Vehicle *</Label>
            <Select
              value={formData.vehicle_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.year} {vehicle.make} {vehicle.model} - ${parseFloat(vehicle.price).toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale_price">Sale Price *</Label>
            <Input
              id="sale_price"
              name="sale_price"
              type="number"
              step="0.01"
              value={formData.sale_price}
              onChange={(e) => setFormData(prev => ({ ...prev, sale_price: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_date">Delivery Date</Label>
            <Input
              id="delivery_date"
              name="delivery_date"
              type="date"
              value={formData.delivery_date}
              onChange={(e) => setFormData(prev => ({ ...prev, delivery_date: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}