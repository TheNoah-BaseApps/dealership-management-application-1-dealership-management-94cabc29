'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SaleWizard from '@/components/sales/SaleWizard';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function NewSalePage() {
  const router = useRouter();

  const handleSuccess = (saleId) => {
    toast.success('Sale created successfully');
    router.push(`/sales/${saleId}`);
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All progress will be lost.')) {
      router.push('/sales');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/sales')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Sale</h1>
          <p className="text-gray-600 mt-1">Create a new sales transaction</p>
        </div>
      </div>

      <Card className="p-6">
        <SaleWizard onSuccess={handleSuccess} onCancel={handleCancel} />
      </Card>
    </div>
  );
}