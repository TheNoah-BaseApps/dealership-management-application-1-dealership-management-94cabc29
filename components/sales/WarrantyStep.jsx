'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function WarrantyStep({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Warranty Package</h3>
        <div className="space-y-2">
          <Label htmlFor="warranty_package">Select Warranty</Label>
          <Select
            value={formData.warranty_package}
            onValueChange={(value) => setFormData(prev => ({ ...prev, warranty_package: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select warranty (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Warranty</SelectItem>
              <SelectItem value="basic">Basic Warranty (1 year)</SelectItem>
              <SelectItem value="extended">Extended Warranty (3 years)</SelectItem>
              <SelectItem value="premium">Premium Warranty (5 years)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}