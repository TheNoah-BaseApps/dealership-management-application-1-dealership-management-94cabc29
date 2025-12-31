'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Car, Users, TrendingUp, Shield, ShoppingCart, Wrench } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">DealerPro</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Sign In
            </Button>
            <Button onClick={() => router.push('/register')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Dealership Management
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Automate leads, sales, inventory, and customer engagement with actionable insights.
            Streamline your dealership operations and boost conversions.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/register')}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/login')}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Users className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Lead Management</h3>
            <p className="text-gray-600">
              Capture, qualify, and nurture leads automatically. Smart assignment and follow-up scheduling.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <TrendingUp className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sales Pipeline</h3>
            <p className="text-gray-600">
              Track sales from quote to delivery. Process financing, trade-ins, and warranties seamlessly.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <ShoppingCart className="h-12 w-12 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Order Management</h3>
            <p className="text-gray-600">
              Track vehicle orders from quote to delivery. Manage payments, deposits, and delivery schedules.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Wrench className="h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Service Scheduling</h3>
            <p className="text-gray-600">
              Schedule and manage service appointments. Assign technicians and track service completion.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Car className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Inventory Tracking</h3>
            <p className="text-gray-600">
              Real-time vehicle availability, pricing, and status updates. Never oversell inventory.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Shield className="h-12 w-12 text-orange-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analytics & Reports</h3>
            <p className="text-gray-600">
              Track KPIs, conversion rates, and salesperson performance. Data-driven decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2024 DealerPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}