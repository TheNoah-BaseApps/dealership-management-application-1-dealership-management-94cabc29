'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function LeadForm({ lead, onSuccess }) {
  const [formData, setFormData] = useState({
    lead_source: '',
    lead_status: 'new',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    vehicle_interested: '',
    inquiry_date: new Date().toISOString().split('T')[0],
    follow_up_date: '',
    estimated_value: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData({
        lead_source: lead.lead_source || '',
        lead_status: lead.lead_status || 'new',
        contact_name: lead.contact_name || '',
        contact_phone: lead.contact_phone || '',
        contact_email: lead.contact_email || '',
        vehicle_interested: lead.vehicle_interested || '',
        inquiry_date: lead.inquiry_date ? lead.inquiry_date.split('T')[0] : '',
        follow_up_date: lead.follow_up_date ? lead.follow_up_date.split('T')[0] : '',
        estimated_value: lead.estimated_value || '',
        notes: lead.notes || '',
      });
    }
  }, [lead]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = lead ? `/api/leads/${lead.id}` : '/api/leads';
      const method = lead ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to save lead');
      }

      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        throw new Error(data.error || 'Save failed');
      }
    } catch (err) {
      console.error('Save lead error:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_name">Contact Name *</Label>
          <Input
            id="contact_name"
            name="contact_name"
            value={formData.contact_name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_email">Email *</Label>
          <Input
            id="contact_email"
            name="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_phone">Phone *</Label>
          <Input
            id="contact_phone"
            name="contact_phone"
            type="tel"
            value={formData.contact_phone}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lead_source">Lead Source *</Label>
          <Select
            value={formData.lead_source}
            onValueChange={(value) => setFormData(prev => ({ ...prev, lead_source: value }))}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="walk-in">Walk-in</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="social-media">Social Media</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lead_status">Status</Label>
          <Select
            value={formData.lead_status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, lead_status: value }))}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="negotiating">Negotiating</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle_interested">Vehicle Interested</Label>
          <Input
            id="vehicle_interested"
            name="vehicle_interested"
            value={formData.vehicle_interested}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimated_value">Estimated Value</Label>
          <Input
            id="estimated_value"
            name="estimated_value"
            type="number"
            step="0.01"
            value={formData.estimated_value}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="follow_up_date">Follow-up Date</Label>
          <Input
            id="follow_up_date"
            name="follow_up_date"
            type="date"
            value={formData.follow_up_date}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          disabled={loading}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : lead ? 'Update Lead' : 'Create Lead'}
      </Button>
    </form>
  );
}