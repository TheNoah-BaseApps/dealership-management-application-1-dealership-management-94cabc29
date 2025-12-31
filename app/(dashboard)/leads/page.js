'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DataTable from '@/components/common/DataTable';
import LeadForm from '@/components/leads/LeadForm';
import SearchBar from '@/components/common/SearchBar';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/leads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data = await res.json();
      if (data.success) {
        setLeads(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to load leads');
      }
    } catch (err) {
      console.error('Fetch leads error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchLeads();
    toast.success('Lead created successfully');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to delete lead');
      }

      fetchLeads();
      toast.success('Lead deleted successfully');
    } catch (err) {
      console.error('Delete lead error:', err);
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'contact_name', label: 'Name', sortable: true },
    { key: 'contact_email', label: 'Email', sortable: true },
    { key: 'contact_phone', label: 'Phone' },
    { key: 'vehicle_interested', label: 'Vehicle Interest' },
    { key: 'lead_status', label: 'Status', sortable: true },
    { key: 'lead_source', label: 'Source', sortable: true },
    { 
      key: 'estimated_value', 
      label: 'Est. Value', 
      sortable: true,
      render: (value) => value ? `$${parseFloat(value).toLocaleString()}` : 'N/A'
    },
  ];

  const filteredLeads = leads.filter(lead => 
    lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.vehicle_interested?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">Manage and track your sales leads</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      <SearchBar 
        value={searchTerm} 
        onChange={setSearchTerm} 
        placeholder="Search leads by name, email, or vehicle..." 
      />

      <DataTable 
        columns={columns} 
        data={filteredLeads}
        onView={(lead) => window.location.href = `/leads/${lead.id}`}
        onDelete={handleDelete}
      />

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          <LeadForm onSuccess={handleAddSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}