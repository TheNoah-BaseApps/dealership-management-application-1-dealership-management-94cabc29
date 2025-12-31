'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FinancingStep({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Financing Options</h3>
        <div className="space-y-2">
          <Label htmlFor="financing_type">Financing Type *</Label>
          <Select
            value={formData.financing_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, financing_type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="loan">Loan</SelectItem>
              <SelectItem value="lease">Lease</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}