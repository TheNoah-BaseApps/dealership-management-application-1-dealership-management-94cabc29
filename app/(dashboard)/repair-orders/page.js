'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wrench, Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function RepairOrdersPage() {
  const [repairOrders, setRepairOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    repair_order_id: '',
    customer_id: '',
    vehicle_id: '',
    issue_reported: '',
    diagnosis_summary: '',
    repair_date: '',
    parts_replaced: '',
    labor_hours: '',
    repair_cost: '',
    warranty_details: '',
    technician_id: '',
    repair_status: 'Pending'
  });

  useEffect(() => {
    fetchRepairOrders();
  }, [filterStatus]);

  async function fetchRepairOrders() {
    try {
      setLoading(true);
      const url = filterStatus 
        ? `/api/repair-orders?status=${filterStatus}`
        : '/api/repair-orders';
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setRepairOrders(data.data || []);
      } else {
        toast.error('Failed to fetch repair orders');
      }
    } catch (error) {
      console.error('Error fetching repair orders:', error);
      toast.error('Error loading repair orders');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const url = selectedOrder ? `/api/repair-orders/${selectedOrder.id}` : '/api/repair-orders';
      const method = selectedOrder ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(selectedOrder ? 'Repair order updated successfully' : 'Repair order created successfully');
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        fetchRepairOrders();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving repair order:', error);
      toast.error('Error saving repair order');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this repair order?')) return;
    
    try {
      const response = await fetch(`/api/repair-orders/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Repair order deleted successfully');
        fetchRepairOrders();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting repair order:', error);
      toast.error('Error deleting repair order');
    }
  }

  function handleEdit(order) {
    setSelectedOrder(order);
    setFormData({
      repair_order_id: order.repair_order_id || '',
      customer_id: order.customer_id || '',
      vehicle_id: order.vehicle_id || '',
      issue_reported: order.issue_reported || '',
      diagnosis_summary: order.diagnosis_summary || '',
      repair_date: order.repair_date?.split('T')[0] || '',
      parts_replaced: order.parts_replaced || '',
      labor_hours: order.labor_hours || '',
      repair_cost: order.repair_cost || '',
      warranty_details: order.warranty_details || '',
      technician_id: order.technician_id || '',
      repair_status: order.repair_status || 'Pending'
    });
    setShowEditModal(true);
  }

  function resetForm() {
    setFormData({
      repair_order_id: '',
      customer_id: '',
      vehicle_id: '',
      issue_reported: '',
      diagnosis_summary: '',
      repair_date: '',
      parts_replaced: '',
      labor_hours: '',
      repair_cost: '',
      warranty_details: '',
      technician_id: '',
      repair_status: 'Pending'
    });
    setSelectedOrder(null);
  }

  const filteredOrders = repairOrders.filter(order => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      order.repair_order_id?.toLowerCase().includes(search) ||
      order.vehicle_id?.toLowerCase().includes(search) ||
      order.issue_reported?.toLowerCase().includes(search)
    );
  });

  const stats = {
    total: repairOrders.length,
    pending: repairOrders.filter(o => o.repair_status === 'Pending').length,
    inProgress: repairOrders.filter(o => o.repair_status === 'In Progress').length,
    completed: repairOrders.filter(o => o.repair_status === 'Completed').length
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repair Orders</h1>
          <p className="text-gray-600">Manage vehicle repair orders and maintenance</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Repair Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by order ID, vehicle ID, or issue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Repair Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading repair orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No repair orders found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first repair order</p>
              <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Repair Order
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Vehicle ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Issue</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Repair Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Cost</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{order.repair_order_id}</td>
                      <td className="py-3 px-4">{order.vehicle_id}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{order.issue_reported}</td>
                      <td className="py-3 px-4">{new Date(order.repair_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">${(order.repair_cost || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.repair_status === 'Completed' ? 'bg-green-100 text-green-800' :
                          order.repair_status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          order.repair_status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.repair_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(order)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(order.id)}>
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
            <DialogTitle>{selectedOrder ? 'Edit Repair Order' : 'Add Repair Order'}</DialogTitle>
            <DialogDescription>
              {selectedOrder ? 'Update the repair order details below' : 'Enter the repair order details below'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="repair_order_id">Order ID *</Label>
                <Input
                  id="repair_order_id"
                  value={formData.repair_order_id}
                  onChange={(e) => setFormData({...formData, repair_order_id: e.target.value})}
                  required
                  disabled={!!selectedOrder}
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

            <div>
              <Label htmlFor="issue_reported">Issue Reported *</Label>
              <Textarea
                id="issue_reported"
                value={formData.issue_reported}
                onChange={(e) => setFormData({...formData, issue_reported: e.target.value})}
                required
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="diagnosis_summary">Diagnosis Summary</Label>
              <Textarea
                id="diagnosis_summary"
                value={formData.diagnosis_summary}
                onChange={(e) => setFormData({...formData, diagnosis_summary: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="repair_date">Repair Date *</Label>
                <Input
                  id="repair_date"
                  type="date"
                  value={formData.repair_date}
                  onChange={(e) => setFormData({...formData, repair_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="repair_status">Status *</Label>
                <Select value={formData.repair_status} onValueChange={(value) => setFormData({...formData, repair_status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="parts_replaced">Parts Replaced</Label>
              <Textarea
                id="parts_replaced"
                value={formData.parts_replaced}
                onChange={(e) => setFormData({...formData, parts_replaced: e.target.value})}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="labor_hours">Labor Hours</Label>
                <Input
                  id="labor_hours"
                  type="number"
                  value={formData.labor_hours}
                  onChange={(e) => setFormData({...formData, labor_hours: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="repair_cost">Repair Cost *</Label>
                <Input
                  id="repair_cost"
                  type="number"
                  value={formData.repair_cost}
                  onChange={(e) => setFormData({...formData, repair_cost: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="warranty_details">Warranty Details</Label>
              <Textarea
                id="warranty_details"
                value={formData.warranty_details}
                onChange={(e) => setFormData({...formData, warranty_details: e.target.value})}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="technician_id">Technician ID</Label>
              <Input
                id="technician_id"
                value={formData.technician_id}
                onChange={(e) => setFormData({...formData, technician_id: e.target.value})}
              />
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
                {selectedOrder ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}