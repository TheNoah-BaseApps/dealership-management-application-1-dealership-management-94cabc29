'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClipboardList, Plus, Pencil, Trash2, Search, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function ServiceHistoryPage() {
  const [serviceRecords, setServiceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    service_history_id: '',
    vehicle_id: '',
    customer_id: '',
    service_date: '',
    service_type: '',
    service_details: '',
    technician_name: '',
    service_center: '',
    total_cost: '',
    mileage_at_service: '',
    warranty_claim: false,
    service_rating: ''
  });

  useEffect(() => {
    fetchServiceHistory();
  }, []);

  async function fetchServiceHistory() {
    try {
      setLoading(true);
      const response = await fetch('/api/service-history');
      const data = await response.json();
      
      if (data.success) {
        setServiceRecords(data.data || []);
      } else {
        toast.error('Failed to fetch service history');
      }
    } catch (error) {
      console.error('Error fetching service history:', error);
      toast.error('Error loading service history');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const url = selectedRecord ? `/api/service-history/${selectedRecord.id}` : '/api/service-history';
      const method = selectedRecord ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(selectedRecord ? 'Service record updated successfully' : 'Service record created successfully');
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        fetchServiceHistory();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving service record:', error);
      toast.error('Error saving service record');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this service record?')) return;
    
    try {
      const response = await fetch(`/api/service-history/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Service record deleted successfully');
        fetchServiceHistory();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting service record:', error);
      toast.error('Error deleting service record');
    }
  }

  function handleEdit(record) {
    setSelectedRecord(record);
    setFormData({
      service_history_id: record.service_history_id || '',
      vehicle_id: record.vehicle_id || '',
      customer_id: record.customer_id || '',
      service_date: record.service_date?.split('T')[0] || '',
      service_type: record.service_type || '',
      service_details: record.service_details || '',
      technician_name: record.technician_name || '',
      service_center: record.service_center || '',
      total_cost: record.total_cost || '',
      mileage_at_service: record.mileage_at_service || '',
      warranty_claim: record.warranty_claim || false,
      service_rating: record.service_rating || ''
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      service_history_id: '',
      vehicle_id: '',
      customer_id: '',
      service_date: '',
      service_type: '',
      service_details: '',
      technician_name: '',
      service_center: '',
      total_cost: '',
      mileage_at_service: '',
      warranty_claim: false,
      service_rating: ''
    });
    setSelectedRecord(null);
  }

  const filteredRecords = serviceRecords.filter(record => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      record.service_history_id?.toLowerCase().includes(search) ||
      record.vehicle_id?.toLowerCase().includes(search) ||
      record.service_type?.toLowerCase().includes(search) ||
      record.service_center?.toLowerCase().includes(search)
    );
  });

  const stats = {
    total: serviceRecords.length,
    totalCost: serviceRecords.reduce((sum, r) => sum + (r.total_cost || 0), 0),
    warrantyServices: serviceRecords.filter(r => r.warranty_claim).length,
    avgRating: serviceRecords.filter(r => r.service_rating).length > 0
      ? (serviceRecords.reduce((sum, r) => sum + (r.service_rating || 0), 0) / serviceRecords.filter(r => r.service_rating).length).toFixed(1)
      : 0
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service History</h1>
          <p className="text-gray-600">Track vehicle service and maintenance records</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service Record
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Services</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Cost</CardDescription>
            <CardTitle className="text-3xl">${stats.totalCost.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Warranty Services</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.warrantyServices}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Rating</CardDescription>
            <CardTitle className="text-3xl text-yellow-600 flex items-center gap-1">
              {stats.avgRating}
              <Star className="h-6 w-6 fill-yellow-600" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by service ID, vehicle ID, service type, or center..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading service history...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No service records found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first service record</p>
              <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service Record
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Service ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Vehicle ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Service Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Service Center</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Cost</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Rating</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{record.service_history_id}</td>
                      <td className="py-3 px-4">{record.vehicle_id}</td>
                      <td className="py-3 px-4">{record.service_type}</td>
                      <td className="py-3 px-4">{new Date(record.service_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{record.service_center}</td>
                      <td className="py-3 px-4">${(record.total_cost || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {record.service_rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span>{record.service_rating}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setShowEditModal(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRecord ? 'Edit Service Record' : 'Add Service Record'}</DialogTitle>
            <DialogDescription>
              {selectedRecord ? 'Update the service record details below' : 'Enter the service record details below'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service_history_id">Service ID *</Label>
                <Input
                  id="service_history_id"
                  value={formData.service_history_id}
                  onChange={(e) => setFormData({...formData, service_history_id: e.target.value})}
                  required
                  disabled={!!selectedRecord}
                />
              </div>
              <div>
                <Label htmlFor="vehicle_id">Vehicle ID *</Label>
                <Input
                  id="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="customer_id">Customer ID *</Label>
              <Input
                id="customer_id"
                value={formData.customer_id}
                onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service_date">Service Date *</Label>
                <Input
                  id="service_date"
                  type="date"
                  value={formData.service_date}
                  onChange={(e) => setFormData({...formData, service_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="service_type">Service Type *</Label>
                <Input
                  id="service_type"
                  value={formData.service_type}
                  onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                  required
                  placeholder="e.g., Oil Change, Brake Repair"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="service_details">Service Details</Label>
              <Textarea
                id="service_details"
                value={formData.service_details}
                onChange={(e) => setFormData({...formData, service_details: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="technician_name">Technician Name</Label>
                <Input
                  id="technician_name"
                  value={formData.technician_name}
                  onChange={(e) => setFormData({...formData, technician_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="service_center">Service Center *</Label>
                <Input
                  id="service_center"
                  value={formData.service_center}
                  onChange={(e) => setFormData({...formData, service_center: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total_cost">Total Cost *</Label>
                <Input
                  id="total_cost"
                  type="number"
                  value={formData.total_cost}
                  onChange={(e) => setFormData({...formData, total_cost: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mileage_at_service">Mileage at Service *</Label>
                <Input
                  id="mileage_at_service"
                  type="number"
                  value={formData.mileage_at_service}
                  onChange={(e) => setFormData({...formData, mileage_at_service: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="warranty_claim"
                  checked={formData.warranty_claim}
                  onChange={(e) => setFormData({...formData, warranty_claim: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="warranty_claim">Warranty Claim</Label>
              </div>
              <div>
                <Label htmlFor="service_rating">Service Rating (1-5)</Label>
                <Select 
                  value={formData.service_rating.toString()} 
                  onValueChange={(value) => setFormData({...formData, service_rating: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Rating</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedRecord ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}