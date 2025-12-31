'use client';

import { Badge } from '@/components/ui/badge';

export default function StatusBadge({ status }) {
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    
    // Lead statuses
    if (statusLower === 'new') return 'bg-blue-100 text-blue-800';
    if (statusLower === 'contacted') return 'bg-purple-100 text-purple-800';
    if (statusLower === 'qualified') return 'bg-green-100 text-green-800';
    if (statusLower === 'negotiating') return 'bg-yellow-100 text-yellow-800';
    if (statusLower === 'won') return 'bg-green-100 text-green-800';
    if (statusLower === 'lost') return 'bg-red-100 text-red-800';
    
    // Sale statuses
    if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (statusLower === 'financing') return 'bg-blue-100 text-blue-800';
    if (statusLower === 'approved') return 'bg-green-100 text-green-800';
    if (statusLower === 'delivered') return 'bg-green-100 text-green-800';
    if (statusLower === 'completed') return 'bg-gray-100 text-gray-800';
    
    // Vehicle statuses
    if (statusLower === 'available') return 'bg-green-100 text-green-800';
    if (statusLower === 'reserved') return 'bg-yellow-100 text-yellow-800';
    if (statusLower === 'sold') return 'bg-gray-100 text-gray-800';
    
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Badge className={`${getStatusColor(status)} capitalize`} variant="outline">
      {status || 'Unknown'}
    </Badge>
  );
}