'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function TradeInStep({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Trade-In (Optional)</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trade_in_value">Trade-In Value</Label>
            <Input
              id="trade_in_value"
              name="trade_in_value"
              type="number"
              step="0.01"
              value={formData.trade_in_value}
              onChange={(e) => setFormData(prev => ({ ...prev, trade_in_value: e.target.value }))}
              placeholder="0.00"
            />
          </div>
          <p className="text-sm text-gray-500">
            Leave blank if no trade-in
          </p>
        </div>
      </div>
    </div>
  );
}