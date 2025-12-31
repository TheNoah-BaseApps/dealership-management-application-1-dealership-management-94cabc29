'use client';

import { cn } from '@/lib/utils';
import { Home, Users, DollarSign, Car, TrendingUp, Settings, UserCircle, ClipboardList, MessageSquare, Package, Calendar, Wrench, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar({ isOpen, currentPath, userRole }) {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'manager', 'salesperson', 'finance', 'service'] },
    { name: 'Leads', href: '/leads', icon: ClipboardList, roles: ['admin', 'manager', 'salesperson'] },
    { name: 'Sales', href: '/sales', icon: DollarSign, roles: ['admin', 'manager', 'salesperson', 'finance'] },
    { name: 'Customers', href: '/customers', icon: Users, roles: ['admin', 'manager', 'salesperson', 'finance'] },
    { name: 'Vehicles', href: '/vehicles', icon: Car, roles: ['admin', 'manager', 'salesperson'] },
    { name: 'Customer Engagements', href: '/customer-engagements', icon: MessageSquare, roles: ['admin', 'manager', 'salesperson'] },
    { name: 'Stock Inventory', href: '/stock-inventory', icon: Package, roles: ['admin', 'manager', 'salesperson'] },
    { name: 'Order Management', href: '/order-management', icon: Package, roles: ['admin', 'manager', 'salesperson', 'finance'] },
    { name: 'Service Scheduling', href: '/service-scheduling', icon: Calendar, roles: ['admin', 'manager', 'service'] },
    { name: 'Repair Orders', href: '/repair-orders', icon: Wrench, roles: ['admin', 'manager', 'service'] },
    { name: 'Service History', href: '/service-history', icon: ClipboardList, roles: ['admin', 'manager', 'service'] },
    { name: 'Parts Inventory', href: '/parts-inventory', icon: Package, roles: ['admin', 'manager', 'service'] },
    { name: 'Parts Orders', href: '/parts-orders', icon: ShoppingCart, roles: ['admin', 'manager', 'service'] },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp, roles: ['admin', 'manager'] },
    { name: 'Users', href: '/users', icon: UserCircle, roles: ['admin', 'manager'] },
    { name: 'Profile', href: '/profile', icon: Settings, roles: ['admin', 'manager', 'salesperson', 'finance', 'service'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => {}}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white border-r transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <nav className="h-full overflow-y-auto p-4">
          <ul className="space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}