'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Bell,
  UserCircle,
  HeadphonesIcon,
  UsersIcon,
} from 'lucide-react';

const navItems = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Customer Management',
    items: [
      { name: 'Customers', href: '/customers', icon: Users },
      { name: 'Customer Service', href: '/customer-service', icon: HeadphonesIcon },
      { name: 'Customer Engagement', href: '/customer-engagements', icon: UsersIcon },
    ],
  },
  {
    title: 'Products & Orders',
    items: [
      { name: 'Products', href: '/products', icon: Package },
      { name: 'Orders', href: '/orders', icon: ShoppingCart },
    ],
  },
  {
    title: 'Financial',
    items: [
      { name: 'Revenue', href: '/revenue', icon: DollarSign },
      { name: 'Growth', href: '/growth', icon: TrendingUp },
      { name: 'Reports', href: '/reports', icon: FileText },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Alerts', href: '/alerts', icon: AlertCircle },
      { name: 'Settings', href: '/settings', icon: Settings },
      { name: 'Profile', href: '/profile', icon: UserCircle },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>
      <nav className="px-4 space-y-6">
        {navItems.map((section) => (
          <div key={section.title}>
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}