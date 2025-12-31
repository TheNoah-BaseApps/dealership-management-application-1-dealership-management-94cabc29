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
import { MessageSquare, Plus, Edit, Trash2, Search, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function CommunicationPage() {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedComm, setSelectedComm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    responded: 0,
    pending: 0,
    followUpRequired: 0
  });

  const [formData, setFormData] = useState({
    communication_id: '',
    customer_id: '',
    communication_date: '',
    communication_type: '',
    subject: '',
    message_content: '',
    sent_by: '',
    response_status: 'Pending',
    follow_up_required: false,
    follow_up_date: '',
    channel_used: ''
  });

  useEffect(() => {
    fetchCommunications();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [communications]);

  const fetchCommunications = async () => {
    try {
      const response = await fetch('/api/communication');
      const result = await response.json();
      if (result.success) {
        setCommunications(result.data);
      } else {
        toast.error('Failed to load communications');
      }
    } catch (error) {
      console.error('Error fetching communications:', error);
      toast.error('Error loading communications');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    setStats({
      total: communications.length,
      responded: communications.filter(c => c.response_status === 'Responded').length,
      pending: communications.filter(c => c.response_status === 'Pending').length,
      followUpRequired: communications.filter(c => c.follow_up_required === true).length
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/communication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Communication record created successfully');
        setShowAddModal(false);
        resetForm();
        fetchCommunications();
      } else {
        toast.error(result.error || 'Failed to create communication record');
      }
    } catch (error) {
      console.error('Error creating communication:', error);
      toast.error('Error creating communication record');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/communication/${selectedComm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Communication record updated successfully');
        setShowEditModal(false);
        resetForm();
        fetchCommunications();
      } else {
        toast.error(result.error || 'Failed to update communication record');
      }
    } catch (error) {
      console.error('Error updating communication:', error);
      toast.error('Error updating communication record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this communication record?')) return;

    try {
      const response = await fetch(`/api/communication/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Communication record deleted successfully');
        fetchCommunications();
      } else {
        toast.error(result.error || 'Failed to delete communication record');
      }
    } catch (error) {
      console.error('Error deleting communication:', error);
      toast.error('Error deleting communication record');
    }
  };

  const resetForm = () => {
    setFormData({
      communication_id: '',
      customer_id: '',
      communication_date: '',
      communication_type: '',
      subject: '',
      message_content: '',
      sent_by: '',
      response_status: 'Pending',
      follow_up_required: false,
      follow_up_date: '',
      channel_used: ''
    });
    setSelectedComm(null);
  };

  const openEditModal = (comm) => {
    setSelectedComm(comm);
    setFormData({
      communication_id: comm.communication_id,
      customer_id: comm.customer_id,
      communication_date: comm.communication_date?.split('T')[0] || '',
      communication_type: comm.communication_type,
      subject: comm.subject,
      message_content: comm.message_content,
      sent_by: comm.sent_by,
      response_status: comm.response_status,
      follow_up_required: comm.follow_up_required,
      follow_up_date: comm.follow_up_date?.split('T')[0] || '',
      channel_used: comm.channel_used
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Responded':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'No Response':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCommunications = communications.filter(comm =>
    comm.communication_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comm.sent_by.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && communications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading communications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communication</h1>
          <p className="text-gray-600 mt-1">Manage customer communications and follow-ups</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Communication
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Communications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Responded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.responded}</div>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Follow-up Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.followUpRequired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search communications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Communications Table */}
      <Card>
        <CardContent className="p-0">
          {filteredCommunications.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No communications found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first communication record.</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Communication
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Comm ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sent By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Follow-up</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommunications.map((comm) => (
                  <TableRow key={comm.id}>
                    <TableCell className="font-medium">{comm.communication_id}</TableCell>
                    <TableCell>{comm.subject}</TableCell>
                    <TableCell>{comm.communication_type}</TableCell>
                    <TableCell>{comm.sent_by}</TableCell>
                    <TableCell>
                      {new Date(comm.communication_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(comm.response_status)}>
                        {comm.response_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {comm.follow_up_required ? (
                        <Badge className="bg-blue-100 text-blue-800">Required</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(comm)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(comm.id)}
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

      {/* Add Communication Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Communication</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="communication_id">Communication ID *</Label>
                <Input
                  id="communication_id"
                  required
                  value={formData.communication_id}
                  onChange={(e) => setFormData({ ...formData, communication_id: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="customer_id">Customer ID *</Label>
                <Input
                  id="customer_id"
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="communication_date">Communication Date *</Label>
                <Input
                  id="communication_date"
                  type="date"
                  required
                  value={formData.communication_date}
                  onChange={(e) => setFormData({ ...formData, communication_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="communication_type">Type *</Label>
                <Input
                  id="communication_type"
                  required
                  value={formData.communication_type}
                  onChange={(e) => setFormData({ ...formData, communication_type: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sent_by">Sent By *</Label>
                <Input
                  id="sent_by"
                  required
                  value={formData.sent_by}
                  onChange={(e) => setFormData({ ...formData, sent_by: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="channel_used">Channel Used *</Label>
                <Input
                  id="channel_used"
                  required
                  value={formData.channel_used}
                  onChange={(e) => setFormData({ ...formData, channel_used: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="response_status">Response Status *</Label>
                <select
                  id="response_status"
                  required
                  value={formData.response_status}
                  onChange={(e) => setFormData({ ...formData, response_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Pending">Pending</option>
                  <option value="Responded">Responded</option>
                  <option value="No Response">No Response</option>
                </select>
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
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="message_content">Message Content *</Label>
              <Textarea
                id="message_content"
                required
                value={formData.message_content}
                onChange={(e) => setFormData({ ...formData, message_content: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="follow_up_required"
                checked={formData.follow_up_required}
                onChange={(e) => setFormData({ ...formData, follow_up_required: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="follow_up_required">Follow-up Required</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Communication'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Communication Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Communication</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_communication_id">Communication ID *</Label>
                <Input
                  id="edit_communication_id"
                  required
                  value={formData.communication_id}
                  onChange={(e) => setFormData({ ...formData, communication_id: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_customer_id">Customer ID *</Label>
                <Input
                  id="edit_customer_id"
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_communication_date">Communication Date *</Label>
                <Input
                  id="edit_communication_date"
                  type="date"
                  required
                  value={formData.communication_date}
                  onChange={(e) => setFormData({ ...formData, communication_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_communication_type">Type *</Label>
                <Input
                  id="edit_communication_type"
                  required
                  value={formData.communication_type}
                  onChange={(e) => setFormData({ ...formData, communication_type: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_sent_by">Sent By *</Label>
                <Input
                  id="edit_sent_by"
                  required
                  value={formData.sent_by}
                  onChange={(e) => setFormData({ ...formData, sent_by: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_channel_used">Channel Used *</Label>
                <Input
                  id="edit_channel_used"
                  required
                  value={formData.channel_used}
                  onChange={(e) => setFormData({ ...formData, channel_used: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_response_status">Response Status *</Label>
                <select
                  id="edit_response_status"
                  required
                  value={formData.response_status}
                  onChange={(e) => setFormData({ ...formData, response_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Pending">Pending</option>
                  <option value="Responded">Responded</option>
                  <option value="No Response">No Response</option>
                </select>
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
              <Label htmlFor="edit_subject">Subject *</Label>
              <Input
                id="edit_subject"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_message_content">Message Content *</Label>
              <Textarea
                id="edit_message_content"
                required
                value={formData.message_content}
                onChange={(e) => setFormData({ ...formData, message_content: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit_follow_up_required"
                checked={formData.follow_up_required}
                onChange={(e) => setFormData({ ...formData, follow_up_required: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="edit_follow_up_required">Follow-up Required</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Communication'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}