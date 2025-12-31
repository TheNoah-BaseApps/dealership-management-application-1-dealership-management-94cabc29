'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, MessageSquare, Calendar, TrendingUp, Award } from 'lucide-react';

export default function CustomerEngagementsPage() {
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEngagement, setSelectedEngagement] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    responded: 0,
    needsFollowUp: 0,
    avgRewardPoints: 0
  });

  useEffect(() => {
    fetchEngagements();
  }, []);

  const fetchEngagements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customer-engagements');
      const data = await response.json();
      
      if (data.success) {
        setEngagements(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to load engagements');
      }
    } catch (error) {
      console.error('Error fetching engagements:', error);
      toast.error('Error loading engagements');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const responded = data.filter(e => e.response_received).length;
    const needsFollowUp = data.filter(e => e.follow_up_needed).length;
    const totalPoints = data.reduce((sum, e) => sum + (e.reward_points || 0), 0);
    const avgRewardPoints = total > 0 ? Math.round(totalPoints / total) : 0;

    setStats({ total, responded, needsFollowUp, avgRewardPoints });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this engagement?')) return;

    try {
      const response = await fetch(`/api/customer-engagements/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Engagement deleted successfully');
        fetchEngagements();
      } else {
        toast.error('Failed to delete engagement');
      }
    } catch (error) {
      console.error('Error deleting engagement:', error);
      toast.error('Error deleting engagement');
    }
  };

  const handleEdit = (engagement) => {
    setSelectedEngagement(engagement);
    setIsEditModalOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customer engagements...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Engagements</h1>
            <p className="text-gray-600 mt-1">Track and manage customer interactions and campaigns</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Engagement
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Engagements</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Responses Received</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responded}</div>
              <p className="text-xs text-gray-600 mt-1">
                {stats.total > 0 ? Math.round((stats.responded / stats.total) * 100) : 0}% response rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Needs Follow-up</CardTitle>
              <Calendar className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.needsFollowUp}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Reward Points</CardTitle>
              <Award className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRewardPoints}</div>
            </CardContent>
          </Card>
        </div>

        {/* Engagements Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Engagements</CardTitle>
            <CardDescription>View and manage all customer engagement records</CardDescription>
          </CardHeader>
          <CardContent>
            {engagements.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No engagements yet</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first customer engagement</p>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Engagement
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Engagement ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Response</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Follow-up</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Points</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {engagements.map((engagement) => (
                      <tr key={engagement.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{engagement.engagement_id}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="outline">{engagement.engagement_type}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">{formatDate(engagement.engagement_date)}</td>
                        <td className="px-4 py-3 text-sm">{engagement.communication_method}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant={engagement.response_received ? 'default' : 'secondary'}>
                            {engagement.response_received ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {engagement.follow_up_needed ? (
                            <Badge variant="destructive">Required</Badge>
                          ) : (
                            <Badge variant="secondary">None</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">{engagement.reward_points || 0}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(engagement)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(engagement.id)}
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
      </div>

      {/* Add Modal */}
      <EngagementFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchEngagements}
        mode="create"
      />

      {/* Edit Modal */}
      {selectedEngagement && (
        <EngagementFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEngagement(null);
          }}
          onSuccess={fetchEngagements}
          mode="edit"
          engagement={selectedEngagement}
        />
      )}
    </>
  );
}

function EngagementFormModal({ isOpen, onClose, onSuccess, mode, engagement = null }) {
  const [formData, setFormData] = useState({
    engagement_id: '',
    customer_id: '',
    engagement_type: '',
    engagement_date: '',
    campaign_id: '',
    response_received: false,
    reward_points: 0,
    communication_method: '',
    engagement_outcome: '',
    follow_up_needed: false,
    next_engagement_date: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (engagement && mode === 'edit') {
      setFormData({
        engagement_id: engagement.engagement_id || '',
        customer_id: engagement.customer_id || '',
        engagement_type: engagement.engagement_type || '',
        engagement_date: engagement.engagement_date?.split('T')[0] || '',
        campaign_id: engagement.campaign_id || '',
        response_received: engagement.response_received || false,
        reward_points: engagement.reward_points || 0,
        communication_method: engagement.communication_method || '',
        engagement_outcome: engagement.engagement_outcome || '',
        follow_up_needed: engagement.follow_up_needed || false,
        next_engagement_date: engagement.next_engagement_date?.split('T')[0] || ''
      });
    }
  }, [engagement, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = mode === 'edit' 
        ? `/api/customer-engagements/${engagement.id}`
        : '/api/customer-engagements';
      
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Engagement ${mode === 'edit' ? 'updated' : 'created'} successfully`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error submitting form');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit' : 'Add'} Customer Engagement</DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Update' : 'Create a new'} customer engagement record
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="engagement_id">Engagement ID *</Label>
              <Input
                id="engagement_id"
                value={formData.engagement_id}
                onChange={(e) => setFormData({ ...formData, engagement_id: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="customer_id">Customer ID *</Label>
              <Input
                id="customer_id"
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="engagement_type">Engagement Type *</Label>
              <Select
                value={formData.engagement_type}
                onValueChange={(value) => setFormData({ ...formData, engagement_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Phone Call">Phone Call</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="In-Person">In-Person</SelectItem>
                  <SelectItem value="Campaign">Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="communication_method">Communication Method *</Label>
              <Select
                value={formData.communication_method}
                onValueChange={(value) => setFormData({ ...formData, communication_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="Direct Mail">Direct Mail</SelectItem>
                  <SelectItem value="In-Person">In-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="engagement_date">Engagement Date *</Label>
              <Input
                id="engagement_date"
                type="date"
                value={formData.engagement_date}
                onChange={(e) => setFormData({ ...formData, engagement_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="campaign_id">Campaign ID</Label>
              <Input
                id="campaign_id"
                value={formData.campaign_id}
                onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reward_points">Reward Points</Label>
              <Input
                id="reward_points"
                type="number"
                value={formData.reward_points}
                onChange={(e) => setFormData({ ...formData, reward_points: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="next_engagement_date">Next Engagement Date</Label>
              <Input
                id="next_engagement_date"
                type="date"
                value={formData.next_engagement_date}
                onChange={(e) => setFormData({ ...formData, next_engagement_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="engagement_outcome">Engagement Outcome</Label>
            <Textarea
              id="engagement_outcome"
              value={formData.engagement_outcome}
              onChange={(e) => setFormData({ ...formData, engagement_outcome: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="response_received"
                checked={formData.response_received}
                onChange={(e) => setFormData({ ...formData, response_received: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="response_received" className="cursor-pointer">Response Received</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="follow_up_needed"
                checked={formData.follow_up_needed}
                onChange={(e) => setFormData({ ...formData, follow_up_needed: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="follow_up_needed" className="cursor-pointer">Follow-up Needed</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}