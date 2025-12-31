'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import { Mail, Phone, Calendar } from 'lucide-react';

export default function LeadCard({ lead, onView }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{lead.contact_name}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{lead.vehicle_interested}</p>
          </div>
          <StatusBadge status={lead.lead_status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="h-4 w-4" />
          <span>{lead.contact_email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-4 w-4" />
          <span>{lead.contact_phone}</span>
        </div>
        {lead.follow_up_date && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Follow-up: {new Date(lead.follow_up_date).toLocaleDateString()}</span>
          </div>
        )}
        <Button className="w-full mt-4" onClick={() => onView(lead)}>
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}