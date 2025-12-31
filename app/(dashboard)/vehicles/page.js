'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DataTable from '@/components/common/DataTable';
import VehicleForm from '@/components/vehicles/VehicleForm';
import SearchBar from '@/components/common/SearchBar';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vehicles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const data = await res.json();
      if (data.success) {
        setVehicles(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to load vehicles');
      }
    } catch (err) {
      console.error('Fetch vehicles error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchVehicles();
    toast.success('Vehicle added successfully');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to delete vehicle');
      }

      fetchVehicles();
      toast.success('Vehicle deleted successfully');
    } catch (err) {
      console.error('Delete vehicle error:', err);
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'vin', label: 'VIN', sortable: true },
    { key: 'year', label: 'Year', sortable: true },
    { key: 'make', label: 'Make', sortable: true },
    { key: 'model', label: 'Model', sortable: true },
    { key: 'color', label: 'Color' },
    { 
      key: 'price', 
      label: 'Price', 
      sortable: true,
      render: (value) => `$${parseFloat(value || 0).toLocaleString()}`
    },
    { key: 'status', label: 'Status', sortable: true },
    { 
      key: 'mileage', 
      label: 'Mileage',
      render: (value) => `${parseInt(value || 0).toLocaleString()} mi`
    },
  ];

  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.status?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Inventory</h1>
          <p className="text-gray-600 mt-1">Manage your dealership's vehicle inventory</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      <SearchBar 
        value={searchTerm} 
        onChange={setSearchTerm} 
        placeholder="Search vehicles by VIN, make, model, or status..." 
      />

      <DataTable 
        columns={columns} 
        data={filteredVehicles}
        onDelete={handleDelete}
      />

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <VehicleForm onSuccess={handleAddSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}