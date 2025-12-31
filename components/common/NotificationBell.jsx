'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchNotificationCount();
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const unread = data.data.filter(n => !n.sent).length;
          setCount(unread);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  return (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          variant="destructive"
        >
          {count}
        </Badge>
      )}
    </Button>
  );
}