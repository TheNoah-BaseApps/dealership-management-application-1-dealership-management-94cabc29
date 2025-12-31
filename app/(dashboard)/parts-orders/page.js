'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Edit, Trash2, Search, Package, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function PartsOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');

  const orderStatuses = ['Pending', 'Confirmed', 'In Transit', 'Delivered', 'Cancelled'];
  const paymentStatuses = ['Pending', 'Paid', 'Partial', 'Overdue'];

  useEffect(() => {
    fetchOrders();
    fetchParts();
  }, [filterStatus, filterPayment]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('order_status', filterStatus);
      if (filterPayment !== 'all') params.append('payment_status', filterPayment);

      const response = await fetch(`/api/parts-orders?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      } else {
        toast.error('Failed to load parts orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error loading parts orders');
    } finally {
      setLoading(false);
    }
  }

  async function fetchParts() {
    try {
      const response = await fetch('/api/parts-inventory');
      const data = await response.json();
      if (data.success) {
        setParts(data.data);
      }
    } catch (error) {
      console.error('Error fetching parts:', error);
    }
  }

  async function handleDelete(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const response = await fetch(`/api/parts-orders/${orderId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Order deleted successfully');
        fetchOrders();
      } else {
        toast.error(data.error || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error deleting order');
    }
  }

  const filteredOrders = orders.filter(order =>
    order.parts_order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplier_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.part_name && order.part_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.delivery_tracking_id && order.delivery_tracking_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingOrders = orders.filter(o => o.order_status === 'Pending' || o.order_status === 'Confirmed');
  const totalOrderValue = orders.reduce((sum, o) => sum + o.total_cost, 0);
  const deliveredOrders = orders.filter(o => o.order_status === 'Delivered').length;

  function getStatusColor(status) {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Confirmed': 'bg-blue-100 text-blue-800',
      'In Transit': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  function getPaymentColor(status) {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Paid': 'bg-green-100 text-green-800',
      'Partial': 'bg-blue-100 text-blue-800',
      'Overdue': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parts Orders</h1>
          <p className="text-gray-600 mt-1">Manage parts procurement and orders</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalOrderValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{deliveredOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {orderStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger>
                <SelectValue placeholder="All Payment Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Statuses</SelectItem>
                {paymentStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
          <CardDescription>
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first parts order.</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium">Part</th>
                    <th className="text-left py-3 px-4 font-medium">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium">Supplier</th>
                    <th className="text-left py-3 px-4 font-medium">Total Cost</th>
                    <th className="text-left py-3 px-4 font-medium">Order Status</th>
                    <th className="text-left py-3 px-4 font-medium">Payment</th>
                    <th className="text-left py-3 px-4 font-medium">Expected Delivery</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{order.parts_order_id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{order.part_name || 'N/A'}</div>
                          <div className="text-sm text-gray-600">{order.part_number || order.part_id}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">{order.quantity_ordered}</td>
                      <td className="py-3 px-4 text-gray-600">{order.supplier_id}</td>
                      <td className="py-3 px-4 font-semibold">${order.total_cost.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(order.order_status)}>
                          {order.order_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getPaymentColor(order.payment_status)}>
                          {order.payment_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {order.expected_delivery 
                          ? new Date(order.expected_delivery).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(order.parts_order_id)}
                          >
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

      {/* Add/Edit Modals */}
      <OrderFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchOrders();
        }}
        parts={parts}
        orderStatuses={orderStatuses}
        paymentStatuses={paymentStatuses}
      />

      {selectedOrder && (
        <OrderFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedOrder(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedOrder(null);
            fetchOrders();
          }}
          order={selectedOrder}
          parts={parts}
          orderStatuses={orderStatuses}
          paymentStatuses={paymentStatuses}
        />
      )}
    </>
  );
}

function OrderFormModal({ isOpen, onClose, onSuccess, order = null, parts, orderStatuses, paymentStatuses }) {
  const [formData, setFormData] = useState({
    part_id: '',
    quantity_ordered: 1,
    supplier_id: '',
    expected_delivery: '',
    order_status: 'Pending',
    unit_cost: 0,
    payment_status: 'Pending',
    delivery_tracking_id: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData({
        part_id: order.part_id,
        quantity_ordered: order.quantity_ordered,
        supplier_id: order.supplier_id,
        expected_delivery: order.expected_delivery ? new Date(order.expected_delivery).toISOString().split('T')[0] : '',
        order_status: order.order_status,
        unit_cost: order.unit_cost,
        payment_status: order.payment_status,
        delivery_tracking_id: order.delivery_tracking_id || '',
      });
    }
  }, [order]);

  // Auto-fill supplier when part is selected
  useEffect(() => {
    if (formData.part_id && !order) {
      const selectedPart = parts.find(p => p.part_id === formData.part_id);
      if (selectedPart) {
        setFormData(prev => ({
          ...prev,
          supplier_id: selectedPart.supplier_name,
          unit_cost: selectedPart.unit_price
        }));
      }
    }
  }, [formData.part_id, parts, order]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = order ? `/api/parts-orders/${order.parts_order_id}` : '/api/parts-orders';
      const method = order ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(order ? 'Order updated successfully' : 'Order created successfully');
        onSuccess();
      } else {
        toast.error(data.error || 'Failed to save order');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Error saving order');
    } finally {
      setSubmitting(false);
    }
  }

  const totalCost = formData.quantity_ordered * formData.unit_cost;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order ? 'Edit Order' : 'Create New Order'}</DialogTitle>
          <DialogDescription>
            {order ? 'Update order information' : 'Place a new parts order'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="part_id">Part *</Label>
              <Select
                value={formData.part_id}
                onValueChange={(value) => setFormData({ ...formData, part_id: value })}
                disabled={!!order}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select part" />
                </SelectTrigger>
                <SelectContent>
                  {parts.map(part => (
                    <SelectItem key={part.part_id} value={part.part_id}>
                      {part.part_name} ({part.part_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity_ordered">Quantity *</Label>
              <Input
                id="quantity_ordered"
                type="number"
                value={formData.quantity_ordered}
                onChange={(e) => setFormData({ ...formData, quantity_ordered: parseInt(e.target.value) })}
                required
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="unit_cost">Unit Cost *</Label>
              <Input
                id="unit_cost"
                type="number"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: parseInt(e.target.value) })}
                required
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="supplier_id">Supplier ID *</Label>
              <Input
                id="supplier_id"
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="expected_delivery">Expected Delivery</Label>
              <Input
                id="expected_delivery"
                type="date"
                value={formData.expected_delivery}
                onChange={(e) => setFormData({ ...formData, expected_delivery: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="order_status">Order Status *</Label>
              <Select
                value={formData.order_status}
                onValueChange={(value) => setFormData({ ...formData, order_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_status">Payment Status *</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="delivery_tracking_id">Tracking ID</Label>
              <Input
                id="delivery_tracking_id"
                value={formData.delivery_tracking_id}
                onChange={(e) => setFormData({ ...formData, delivery_tracking_id: e.target.value })}
                placeholder="Optional tracking number"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Cost:</span>
              <span className="text-2xl font-bold text-green-600">
                ${totalCost.toLocaleString()}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : order ? 'Update Order' : 'Create Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}