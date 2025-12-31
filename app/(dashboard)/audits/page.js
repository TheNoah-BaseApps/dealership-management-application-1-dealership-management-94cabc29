'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Plus, Edit, Trash2, Search, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function AuditsPage() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0
  });

  const [formData, setFormData] = useState({
    audit_id: '',
    audit_type: '',
    audit_date: '',
    auditor_name: '',
    area_audited: '',
    audit_status: 'Pending',
    non_compliance_issues: '',
    corrective_actions: '',
    report_submission_date: '',
    follow_up_date: '',
    audit_summary: ''
  });

  useEffect(() => {
    fetchAudits();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [audits]);

  const fetchAudits = async () => {
    try {
      const response = await fetch('/api/audits');
      const result = await response.json();
      if (result.success) {
        setAudits(result.data);
      } else {
        toast.error('Failed to load audits');
      }
    } catch (error) {
      console.error('Error fetching audits:', error);
      toast.error('Error loading audits');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    setStats({
      total: audits.length,
      completed: audits.filter(a => a.audit_status === 'Completed').length,
      inProgress: audits.filter(a => a.audit_status === 'In Progress').length,
      pending: audits.filter(a => a.audit_status === 'Pending').length
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Audit created successfully');
        setShowAddModal(false);
        resetForm();
        fetchAudits();
      } else {
        toast.error(result.error || 'Failed to create audit');
      }
    } catch (error) {
      console.error('Error creating audit:', error);
      toast.error('Error creating audit');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/audits/${selectedAudit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Audit updated successfully');
        setShowEditModal(false);
        resetForm();
        fetchAudits();
      } else {
        toast.error(result.error || 'Failed to update audit');
      }
    } catch (error) {
      console.error('Error updating audit:', error);
      toast.error('Error updating audit');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this audit?')) return;

    try {
      const response = await fetch(`/api/audits/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Audit deleted successfully');
        fetchAudits();
      } else {
        toast.error(result.error || 'Failed to delete audit');
      }
    } catch (error) {
      console.error('Error deleting audit:', error);
      toast.error('Error deleting audit');
    }
  };

  const resetForm = () => {
    setFormData({
      audit_id: '',
      audit_type: '',
      audit_date: '',
      auditor_name: '',
      area_audited: '',
      audit_status: 'Pending',
      non_compliance_issues: '',
      corrective_actions: '',
      report_submission_date: '',
      follow_up_date: '',
      audit_summary: ''
    });
    setSelectedAudit(null);
  };

  const openEditModal = (audit) => {
    setSelectedAudit(audit);
    setFormData({
      audit_id: audit.audit_id,
      audit_type: audit.audit_type,
      audit_date: audit.audit_date?.split('T')[0] || '',
      auditor_name: audit.auditor_name,
      area_audited: audit.area_audited,
      audit_status: audit.audit_status,
      non_compliance_issues: audit.non_compliance_issues || '',
      corrective_actions: audit.corrective_actions || '',
      report_submission_date: audit.report_submission_date?.split('T')[0] || '',
      follow_up_date: audit.follow_up_date?.split('T')[0] || '',
      audit_summary: audit.audit_summary || ''
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAudits = audits.filter(audit =>
    audit.audit_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audit.auditor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audit.area_audited.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && audits.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading audits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audits</h1>
          <p className="text-gray-600 mt-1">Manage dealership audits and compliance</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Audit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Audits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search audits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Audits Table */}
      <Card>
        <CardContent className="p-0">
          {filteredAudits.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No audits found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first audit.</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Audit
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Audit ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Auditor</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAudits.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell className="font-medium">{audit.audit_id}</TableCell>
                    <TableCell>{audit.audit_type}</TableCell>
                    <TableCell>{audit.auditor_name}</TableCell>
                    <TableCell>{audit.area_audited}</TableCell>
                    <TableCell>
                      {new Date(audit.audit_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(audit.audit_status)}>
                        {audit.audit_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(audit)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(audit.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Audit Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Audit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="audit_id">Audit ID *</Label>
                <Input
                  id="audit_id"
                  required
                  value={formData.audit_id}
                  onChange={(e) => setFormData({ ...formData, audit_id: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="audit_type">Audit Type *</Label>
                <Input
                  id="audit_type"
                  required
                  value={formData.audit_type}
                  onChange={(e) => setFormData({ ...formData, audit_type: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="audit_date">Audit Date *</Label>
                <Input
                  id="audit_date"
                  type="date"
                  required
                  value={formData.audit_date}
                  onChange={(e) => setFormData({ ...formData, audit_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="auditor_name">Auditor Name *</Label>
                <Input
                  id="auditor_name"
                  required
                  value={formData.auditor_name}
                  onChange={(e) => setFormData({ ...formData, auditor_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="area_audited">Area Audited *</Label>
                <Input
                  id="area_audited"
                  required
                  value={formData.area_audited}
                  onChange={(e) => setFormData({ ...formData, area_audited: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="audit_status">Status *</Label>
                <select
                  id="audit_status"
                  required
                  value={formData.audit_status}
                  onChange={(e) => setFormData({ ...formData, audit_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <Label htmlFor="report_submission_date">Report Submission Date</Label>
                <Input
                  id="report_submission_date"
                  type="date"
                  value={formData.report_submission_date}
                  onChange={(e) => setFormData({ ...formData, report_submission_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="follow_up_date">Follow-up Date</Label>
                <Input
                  id="follow_up_date"
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="non_compliance_issues">Non-Compliance Issues</Label>
              <Textarea
                id="non_compliance_issues"
                value={formData.non_compliance_issues}
                onChange={(e) => setFormData({ ...formData, non_compliance_issues: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="corrective_actions">Corrective Actions</Label>
              <Textarea
                id="corrective_actions"
                value={formData.corrective_actions}
                onChange={(e) => setFormData({ ...formData, corrective_actions: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="audit_summary">Audit Summary</Label>
              <Textarea
                id="audit_summary"
                value={formData.audit_summary}
                onChange={(e) => setFormData({ ...formData, audit_summary: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Audit'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Audit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Audit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_audit_id">Audit ID *</Label>
                <Input
                  id="edit_audit_id"
                  required
                  value={formData.audit_id}
                  onChange={(e) => setFormData({ ...formData, audit_id: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_audit_type">Audit Type *</Label>
                <Input
                  id="edit_audit_type"
                  required
                  value={formData.audit_type}
                  onChange={(e) => setFormData({ ...formData, audit_type: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_audit_date">Audit Date *</Label>
                <Input
                  id="edit_audit_date"
                  type="date"
                  required
                  value={formData.audit_date}
                  onChange={(e) => setFormData({ ...formData, audit_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_auditor_name">Auditor Name *</Label>
                <Input
                  id="edit_auditor_name"
                  required
                  value={formData.auditor_name}
                  onChange={(e) => setFormData({ ...formData, auditor_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_area_audited">Area Audited *</Label>
                <Input
                  id="edit_area_audited"
                  required
                  value={formData.area_audited}
                  onChange={(e) => setFormData({ ...formData, area_audited: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_audit_status">Status *</Label>
                <select
                  id="edit_audit_status"
                  required
                  value={formData.audit_status}
                  onChange={(e) => setFormData({ ...formData, audit_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit_report_submission_date">Report Submission Date</Label>
                <Input
                  id="edit_report_submission_date"
                  type="date"
                  value={formData.report_submission_date}
                  onChange={(e) => setFormData({ ...formData, report_submission_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_follow_up_date">Follow-up Date</Label>
                <Input
                  id="edit_follow_up_date"
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_non_compliance_issues">Non-Compliance Issues</Label>
              <Textarea
                id="edit_non_compliance_issues"
                value={formData.non_compliance_issues}
                onChange={(e) => setFormData({ ...formData, non_compliance_issues: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit_corrective_actions">Corrective Actions</Label>
              <Textarea
                id="edit_corrective_actions"
                value={formData.corrective_actions}
                onChange={(e) => setFormData({ ...formData, corrective_actions: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit_audit_summary">Audit Summary</Label>
              <Textarea
                id="edit_audit_summary"
                value={formData.audit_summary}
                onChange={(e) => setFormData({ ...formData, audit_summary: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Audit'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}