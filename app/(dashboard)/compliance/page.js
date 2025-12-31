'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Search, Edit, Trash2, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CompliancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [stats, setStats] = useState({
    totalRecords: 0,
    compliantRecords: 0,
    pendingRecords: 0,
    overdueRecords: 0
  });

  const [formData, setFormData] = useState({
    compliance_id: '',
    compliance_type: '',
    applicable_regulation: '',
    effective_date: '',
    due_date: '',
    responsible_person: '',
    compliance_status: 'Pending',
    documentation_link: '',
    audit_trail_id: '',
    remarks: '',
    department: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/compliance');
      const data = await response.json();
      
      if (data.success) {
        setRecords(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to load compliance records');
      }
    } catch (error) {
      console.error('Error fetching compliance records:', error);
      toast.error('Error loading compliance records');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalRecords = data.length;
    const compliantRecords = data.filter(r => r.compliance_status === 'Compliant').length;
    const pendingRecords = data.filter(r => r.compliance_status === 'Pending').length;
    const overdueRecords = data.filter(r => {
      const dueDate = new Date(r.due_date);
      return dueDate < new Date() && r.compliance_status !== 'Compliant';
    }).length;
    
    setStats({ totalRecords, compliantRecords, pendingRecords, overdueRecords });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Compliance record created successfully');
        setShowAddModal(false);
        resetForm();
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to create record');
      }
    } catch (error) {
      console.error('Error creating record:', error);
      toast.error('Error creating compliance record');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/compliance/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Compliance record updated successfully');
        setShowEditModal(false);
        setSelectedRecord(null);
        resetForm();
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to update record');
      }
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Error updating compliance record');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this compliance record?')) return;
    
    try {
      const response = await fetch(`/api/compliance/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Compliance record deleted successfully');
        fetchRecords();
      } else {
        toast.error(data.error || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Error deleting compliance record');
    }
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setFormData({
      compliance_id: record.compliance_id,
      compliance_type: record.compliance_type,
      applicable_regulation: record.applicable_regulation,
      effective_date: record.effective_date?.split('T')[0] || '',
      due_date: record.due_date?.split('T')[0] || '',
      responsible_person: record.responsible_person,
      compliance_status: record.compliance_status,
      documentation_link: record.documentation_link || '',
      audit_trail_id: record.audit_trail_id || '',
      remarks: record.remarks || '',
      department: record.department
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      compliance_id: '',
      compliance_type: '',
      applicable_regulation: '',
      effective_date: '',
      due_date: '',
      responsible_person: '',
      compliance_status: 'Pending',
      documentation_link: '',
      audit_trail_id: '',
      remarks: '',
      department: ''
    });
  };

  const filteredRecords = records.filter(record =>
    record.compliance_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.compliance_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const variants = {
      'Pending': 'secondary',
      'Compliant': 'success',
      'Non-Compliant': 'destructive',
      'In Progress': 'warning'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const isOverdue = (dueDate, status) => {
    return new Date(dueDate) < new Date() && status !== 'Compliant';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading compliance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance</h1>
          <p className="text-gray-600 mt-1">Track regulatory compliance and audit requirements</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Compliance Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Compliance Record</DialogTitle>
              <DialogDescription>Create a new compliance tracking record</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="compliance_id">Compliance ID *</Label>
                  <Input
                    id="compliance_id"
                    value={formData.compliance_id}
                    onChange={(e) => setFormData({...formData, compliance_id: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compliance_type">Compliance Type *</Label>
                  <Select
                    value={formData.compliance_type}
                    onValueChange={(value) => setFormData({...formData, compliance_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Safety">Safety</SelectItem>
                      <SelectItem value="Environmental">Environmental</SelectItem>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Data Privacy">Data Privacy</SelectItem>
                      <SelectItem value="Industry Standard">Industry Standard</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="applicable_regulation">Applicable Regulation *</Label>
                <Input
                  id="applicable_regulation"
                  value={formData.applicable_regulation}
                  onChange={(e) => setFormData({...formData, applicable_regulation: e.target.value})}
                  required
                  placeholder="e.g., GDPR, SOX, OSHA 1910.120"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="effective_date">Effective Date *</Label>
                  <Input
                    id="effective_date"
                    type="date"
                    value={formData.effective_date}
                    onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsible_person">Responsible Person *</Label>
                  <Input
                    id="responsible_person"
                    value={formData.responsible_person}
                    onChange={(e) => setFormData({...formData, responsible_person: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({...formData, department: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="compliance_status">Status *</Label>
                <Select
                  value={formData.compliance_status}
                  onValueChange={(value) => setFormData({...formData, compliance_status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Compliant">Compliant</SelectItem>
                    <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="documentation_link">Documentation Link</Label>
                <Input
                  id="documentation_link"
                  type="url"
                  value={formData.documentation_link}
                  onChange={(e) => setFormData({...formData, documentation_link: e.target.value})}
                  placeholder="https://"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="audit_trail_id">Audit Trail ID</Label>
                <Input
                  id="audit_trail_id"
                  value={formData.audit_trail_id}
                  onChange={(e) => setFormData({...formData, audit_trail_id: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Create Record</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Records</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Compliant</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.compliantRecords}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRecords}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdueRecords}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by ID, type, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No compliance records found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first compliance record</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Compliance ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Regulation</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Responsible</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id} className={isOverdue(record.due_date, record.compliance_status) ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium">
                        {record.compliance_id}
                        {isOverdue(record.due_date, record.compliance_status) && (
                          <AlertCircle className="h-4 w-4 text-red-600 inline ml-2" />
                        )}
                      </TableCell>
                      <TableCell>{record.compliance_type}</TableCell>
                      <TableCell>{record.applicable_regulation}</TableCell>
                      <TableCell>{new Date(record.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.responsible_person}</TableCell>
                      <TableCell>{record.department}</TableCell>
                      <TableCell>{getStatusBadge(record.compliance_status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Compliance Record</DialogTitle>
            <DialogDescription>Update compliance record details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_compliance_type">Compliance Type</Label>
                <Select
                  value={formData.compliance_type}
                  onValueChange={(value) => setFormData({...formData, compliance_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Environmental">Environmental</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Data Privacy">Data Privacy</SelectItem>
                    <SelectItem value="Industry Standard">Industry Standard</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_compliance_status">Status</Label>
                <Select
                  value={formData.compliance_status}
                  onValueChange={(value) => setFormData({...formData, compliance_status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Compliant">Compliant</SelectItem>
                    <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_applicable_regulation">Applicable Regulation</Label>
              <Input
                id="edit_applicable_regulation"
                value={formData.applicable_regulation}
                onChange={(e) => setFormData({...formData, applicable_regulation: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_due_date">Due Date</Label>
                <Input
                  id="edit_due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_responsible_person">Responsible Person</Label>
                <Input
                  id="edit_responsible_person"
                  value={formData.responsible_person}
                  onChange={(e) => setFormData({...formData, responsible_person: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_remarks">Remarks</Label>
              <Textarea
                id="edit_remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">Update Record</Button>
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}