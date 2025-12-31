'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RoleSelector({ value, onChange, disabled = false }) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="manager">Manager</SelectItem>
        <SelectItem value="salesperson">Salesperson</SelectItem>
        <SelectItem value="finance">Finance</SelectItem>
        <SelectItem value="service">Service</SelectItem>
      </SelectContent>
    </Select>
  );
}