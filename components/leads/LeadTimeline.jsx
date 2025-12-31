'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LeadTimeline({ leadId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [leadId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      // In a real app, fetch from activity_log table
      // For now, show placeholder
      setActivities([]);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">
        No activity recorded yet
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            {index < activities.length - 1 && (
              <div className="w-px h-full bg-gray-200"></div>
            )}
          </div>
          <div className="flex-1 pb-4">
            <p className="text-sm font-medium">{activity.action}</p>
            <p className="text-xs text-gray-500">{activity.created_at}</p>
          </div>
        </div>
      ))}
    </div>
  );
}