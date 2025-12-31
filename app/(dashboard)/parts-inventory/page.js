'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Edit, Trash2, Search, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function PartsInventoryPage() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);

  const categories = ['Engine', 'Transmission', 'Brakes', 'Suspension', 'Electrical', 'Body', 'Interior', 'Accessories'];
  const locations = ['Warehouse A', 'Warehouse B', 'Service Center', 'Main Store'];

  useEffect(() => {
    fetchParts();
  }, [filterCategory, filterLocation, showLowStock]);

  async function fetchParts() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.append('part_category', filterCategory);
      if (filterLocation !== 'all') params.append('location', filterLocation);
      if (showLowStock) params.append('low_stock', 'true');

      const response = await fetch(`/api/parts-inventory?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setParts(data.data);
      } else {
        toast.error('Failed to load parts inventory');
      }
    } catch (error) {
      console.error('Error fetching parts:', error);
      toast.error('Error loading parts inventory');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(partId) {
    if (!confirm('Are you sure you want to delete this part?')) return;

    try {
      const response = await fetch(`/api/parts-inventory/${partId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Part deleted successfully');
        fetchParts();
      } else {
        toast.error(data.error || 'Failed to delete part');
      }
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Error deleting part');
    }
  }

  const filteredParts = parts.filter(part =>
    part.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockParts = parts.filter(p => p.quantity_available <= p.reorder_level);
  const totalValue = parts.reduce((sum, p) => sum + (p.quantity_available * p.unit_price), 0);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parts Inventory</h1>
          <p className="text-gray-600 mt-1">Manage dealership parts and supplies</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Part
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockParts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(parts.map(p => p.part_category)).size}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={showLowStock ? 'default' : 'outline'}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Low Stock Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Parts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Parts List</CardTitle>
          <CardDescription>
            {filteredParts.length} part{filteredParts.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading parts...</p>
            </div>
          ) : filteredParts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No parts found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first part to inventory.</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Part
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Part Number</th>
                    <th className="text-left py-3 px-4 font-medium">Part Name</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-left py-3 px-4 font-medium">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium">Reorder Level</th>
                    <th className="text-left py-3 px-4 font-medium">Location</th>
                    <th className="text-left py-3 px-4 font-medium">Unit Price</th>
                    <th className="text-left py-3 px-4 font-medium">Supplier</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map((part) => (
                    <tr key={part.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{part.part_number}</td>
                      <td className="py-3 px-4">{part.part_name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{part.part_category}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        {part.quantity_available <= part.reorder_level ? (
                          <span className="text-yellow-600 font-semibold flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            {part.quantity_available}
                          </span>
                        ) : (
                          <span className="text-green-600 font-semibold">{part.quantity_available}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{part.reorder_level}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{part.location}</Badge>
                      </td>
                      <td className="py-3 px-4 font-semibold">${part.unit_price.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600">{part.supplier_name}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedPart(part);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(part.part_id)}
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
      <PartFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchParts();
        }}
        categories={categories}
        locations={locations}
      />

      {selectedPart && (
        <PartFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPart(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedPart(null);
            fetchParts();
          }}
          part={selectedPart}
          categories={categories}
          locations={locations}
        />
      )}
    </>
  );
}

function PartFormModal({ isOpen, onClose, onSuccess, part = null, categories, locations }) {
  const [formData, setFormData] = useState({
    part_name: '',
    part_number: '',
    quantity_available: 0,
    reorder_level: 0,
    location: '',
    supplier_name: '',
    unit_price: 0,
    part_category: '',
    compatibility_info: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (part) {
      setFormData({
        part_name: part.part_name,
        part_number: part.part_number,
        quantity_available: part.quantity_available,
        reorder_level: part.reorder_level,
        location: part.location,
        supplier_name: part.supplier_name,
        unit_price: part.unit_price,
        part_category: part.part_category,
        compatibility_info: part.compatibility_info || '',
      });
    }
  }, [part]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = part ? `/api/parts-inventory/${part.part_id}` : '/api/parts-inventory';
      const method = part ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(part ? 'Part updated successfully' : 'Part added successfully');
        onSuccess();
      } else {
        toast.error(data.error || 'Failed to save part');
      }
    } catch (error) {
      console.error('Error saving part:', error);
      toast.error('Error saving part');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{part ? 'Edit Part' : 'Add New Part'}</DialogTitle>
          <DialogDescription>
            {part ? 'Update part information' : 'Add a new part to inventory'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="part_name">Part Name *</Label>
              <Input
                id="part_name"
                value={formData.part_name}
                onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="part_category">Category *</Label>
              <Select
                value={formData.part_category}
                onValueChange={(value) => setFormData({ ...formData, part_category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity_available">Quantity Available *</Label>
              <Input
                id="quantity_available"
                type="number"
                value={formData.quantity_available}
                onChange={(e) => setFormData({ ...formData, quantity_available: parseInt(e.target.value) })}
                required
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="reorder_level">Reorder Level *</Label>
              <Input
                id="reorder_level"
                type="number"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) })}
                required
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="supplier_name">Supplier Name *</Label>
              <Input
                id="supplier_name"
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="unit_price">Unit Price *</Label>
              <Input
                id="unit_price"
                type="number"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseInt(e.target.value) })}
                required
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="compatibility_info">Compatibility Info</Label>
            <Input
              id="compatibility_info"
              value={formData.compatibility_info}
              onChange={(e) => setFormData({ ...formData, compatibility_info: e.target.value })}
              placeholder="Compatible vehicle models..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : part ? 'Update Part' : 'Add Part'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}