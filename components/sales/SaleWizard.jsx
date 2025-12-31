'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CustomerInfoStep from './CustomerInfoStep';
import VehicleSelectionStep from './VehicleSelectionStep';
import FinancingStep from './FinancingStep';
import TradeInStep from './TradeInStep';
import WarrantyStep from './WarrantyStep';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function SaleWizard({ onSuccess, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_id: '',
    sale_price: '',
    financing_type: 'cash',
    trade_in_vehicle_id: '',
    trade_in_value: '',
    warranty_package: '',
    delivery_date: '',
  });

  const steps = [
    { title: 'Customer', component: CustomerInfoStep },
    { title: 'Vehicle', component: VehicleSelectionStep },
    { title: 'Financing', component: FinancingStep },
    { title: 'Trade-In', component: TradeInStep },
    { title: 'Warranty', component: WarrantyStep },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to create sale');
      }

      const data = await res.json();
      if (data.success) {
        onSuccess(data.data.id);
      } else {
        throw new Error(data.error || 'Failed to create sale');
      }
    } catch (err) {
      console.error('Create sale error:', err);
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.title} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {index + 1}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              index <= currentStep ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-12 h-px mx-2 ${
                index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        <CurrentStepComponent 
          formData={formData}
          setFormData={setFormData}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handleBack}
        >
          {currentStep === 0 ? (
            'Cancel'
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </>
          )}
        </Button>
        <Button onClick={handleNext}>
          {currentStep === steps.length - 1 ? (
            'Complete Sale'
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}