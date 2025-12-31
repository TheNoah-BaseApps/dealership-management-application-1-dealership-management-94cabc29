'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LeadForm from '@/components/leads/LeadForm';
import LeadTimeline from '@/components/leads/LeadTimeline';
import StatusBadge from '@/components/common/StatusBadge';
import { ArrowLeft, Edit, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchLead();
    }
  }, [params.id]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/leads/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch lead');
      }

      const data = await res.json();
      if (data.success) {
        setLead(data.data);
      } else {
        throw new Error(data.error || 'Failed to load lead');
      }
    } catch (err) {
      console.error('Fetch lead error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!confirm('Convert this lead to a customer and create a sale?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/leads/${params.id}/convert`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to convert lead');
      }

      const data = await res.json();
      if (data.success) {
        toast.success('Lead converted successfully');
        router.push(`/sales/${data.data.saleId}`);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Convert lead error:', err);
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/leads/${params.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to delete lead');
      }

      toast.success('Lead deleted successfully');
      router.push('/leads');
    } catch (err) {
      console.error('Delete lead error:', err);
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
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

  if (!lead) {
    return (
      <Alert>
        <AlertDescription>Lead not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/leads')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{lead.contact_name}</h1>
            <p className="text-gray-600 mt-1">Lead Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleConvert}>
            <UserPlus className="h-4 w-4 mr-2" />
            Convert to Sale
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{lead.contact_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{lead.contact_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lead Source</p>
                  <p className="font-medium">{lead.lead_source}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <StatusBadge status={lead.lead_status} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Interest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Vehicle Interested</p>
                  <p className="font-medium">{lead.vehicle_interested || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estimated Value</p>
                  <p className="font-medium">
                    {lead.estimated_value ? `$${parseFloat(lead.estimated_value).toLocaleString()}` : 'Not specified'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{lead.notes || 'No notes available'}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadTimeline leadId={lead.id} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          <LeadForm 
            lead={lead} 
            onSuccess={() => {
              setShowEditModal(false);
              fetchLead();
              toast.success('Lead updated successfully');
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}