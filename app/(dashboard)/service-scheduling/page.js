'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ServiceSchedulingPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    totalAppointments: 0,
    confirmedAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  });

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  async function fetchAppointments() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      
      const response = await fetch(`/api/service-scheduling?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to load appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Error loading appointments');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(appointmentsData) {
    const total = appointmentsData.length;
    const confirmed = appointmentsData.filter(a => a.confirmation_status === 'confirmed').length;
    const pending = appointmentsData.filter(a => a.confirmation_status === 'pending').length;
    const completed = appointmentsData.filter(a => a.confirmation_status === 'completed').length;
    
    setStats({
      totalAppointments: total,
      confirmedAppointments: confirmed,
      pendingAppointments: pending,
      completedAppointments: completed
    });
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    
    try {
      const response = await fetch(`/api/service-scheduling/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Appointment deleted successfully');
        fetchAppointments();
      } else {
        toast.error('Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Error deleting appointment');
    }
  }

  function handleEdit(appointment) {
    setSelectedAppointment(appointment);
    setShowEditDialog(true);
  }

  const filteredAppointments = appointments.filter(appointment =>
    appointment.schedule_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.customer_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.vehicle_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Scheduling</h1>
          <p className="text-gray-500 mt-1">Manage service appointments and technician schedules</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Schedule Appointment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Appointments</CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Confirmed</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmedAppointments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAppointments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            <XCircle className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAppointments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by Schedule ID, Customer, Vehicle, or Service Type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500 mb-4">Get started by scheduling your first service appointment</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Schedule ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Vehicle ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Appointment Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Service Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Time Slot</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{appointment.schedule_id}</td>
                      <td className="py-3 px-4">{appointment.customer_id}</td>
                      <td className="py-3 px-4">{appointment.vehicle_id}</td>
                      <td className="py-3 px-4">{new Date(appointment.appointment_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{appointment.service_type}</td>
                      <td className="py-3 px-4">{appointment.preferred_time_slot}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.confirmation_status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : appointment.confirmation_status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : appointment.confirmation_status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.confirmation_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(appointment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(appointment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Appointment Dialog */}
      <AddAppointmentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={fetchAppointments}
      />

      {/* Edit Appointment Dialog */}
      {selectedAppointment && (
        <EditAppointmentDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          appointment={selectedAppointment}
          onSuccess={fetchAppointments}
        />
      )}
    </div>
  );
}

function AddAppointmentDialog({ open, onOpenChange, onSuccess }) {
  const [formData, setFormData] = useState({
    schedule_id: '',
    customer_id: '',
    vehicle_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    service_type: '',
    preferred_time_slot: '',
    technician_id: '',
    booking_channel: 'online',
    confirmation_status: 'pending',
    remarks: ''
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/service-scheduling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Appointment created successfully');
        onOpenChange(false);
        onSuccess();
        setFormData({
          schedule_id: '',
          customer_id: '',
          vehicle_id: '',
          appointment_date: new Date().toISOString().split('T')[0],
          service_type: '',
          preferred_time_slot: '',
          technician_id: '',
          booking_channel: 'online',
          confirmation_status: 'pending',
          remarks: ''
        });
      } else {
        toast.error(data.error || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Error creating appointment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Service Appointment</DialogTitle>
          <DialogDescription>Create a new service appointment</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="schedule_id">Schedule ID *</Label>
              <Input
                id="schedule_id"
                value={formData.schedule_id}
                onChange={(e) => setFormData({ ...formData, schedule_id: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="customer_id">Customer ID *</Label>
              <Input
                id="customer_id"
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="vehicle_id">Vehicle ID *</Label>
              <Input
                id="vehicle_id"
                value={formData.vehicle_id}
                onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="appointment_date">Appointment Date *</Label>
              <Input
                id="appointment_date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="service_type">Service Type *</Label>
              <Select value={formData.service_type} onValueChange={(value) => setFormData({ ...formData, service_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oil_change">Oil Change</SelectItem>
                  <SelectItem value="tire_rotation">Tire Rotation</SelectItem>
                  <SelectItem value="brake_service">Brake Service</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="preferred_time_slot">Preferred Time Slot *</Label>
              <Select value={formData.preferred_time_slot} onValueChange={(value) => setFormData({ ...formData, preferred_time_slot: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8:00-10:00">8:00 AM - 10:00 AM</SelectItem>
                  <SelectItem value="10:00-12:00">10:00 AM - 12:00 PM</SelectItem>
                  <SelectItem value="12:00-14:00">12:00 PM - 2:00 PM</SelectItem>
                  <SelectItem value="14:00-16:00">2:00 PM - 4:00 PM</SelectItem>
                  <SelectItem value="16:00-18:00">4:00 PM - 6:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="technician_id">Technician ID</Label>
              <Input
                id="technician_id"
                value={formData.technician_id}
                onChange={(e) => setFormData({ ...formData, technician_id: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="booking_channel">Booking Channel *</Label>
              <Select value={formData.booking_channel} onValueChange={(value) => setFormData({ ...formData, booking_channel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="walk-in">Walk-in</SelectItem>
                  <SelectItem value="mobile_app">Mobile App</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="confirmation_status">Confirmation Status *</Label>
              <Select value={formData.confirmation_status} onValueChange={(value) => setFormData({ ...formData, confirmation_status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Scheduling...' : 'Schedule Appointment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditAppointmentDialog({ open, onOpenChange, appointment, onSuccess }) {
  const [formData, setFormData] = useState(appointment);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData(appointment);
  }, [appointment]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/service-scheduling/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Appointment updated successfully');
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(data.error || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Error updating appointment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
          <DialogDescription>Update appointment information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_appointment_date">Appointment Date</Label>
              <Input
                id="edit_appointment_date"
                type="date"
                value={formData.appointment_date?.split('T')[0] || ''}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_preferred_time_slot">Preferred Time Slot</Label>
              <Select value={formData.preferred_time_slot} onValueChange={(value) => setFormData({ ...formData, preferred_time_slot: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8:00-10:00">8:00 AM - 10:00 AM</SelectItem>
                  <SelectItem value="10:00-12:00">10:00 AM - 12:00 PM</SelectItem>
                  <SelectItem value="12:00-14:00">12:00 PM - 2:00 PM</SelectItem>
                  <SelectItem value="14:00-16:00">2:00 PM - 4:00 PM</SelectItem>
                  <SelectItem value="16:00-18:00">4:00 PM - 6:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_technician_id">Technician ID</Label>
              <Input
                id="edit_technician_id"
                value={formData.technician_id || ''}
                onChange={(e) => setFormData({ ...formData, technician_id: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_confirmation_status">Confirmation Status</Label>
              <Select value={formData.confirmation_status} onValueChange={(value) => setFormData({ ...formData, confirmation_status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="edit_remarks">Remarks</Label>
            <Textarea
              id="edit_remarks"
              value={formData.remarks || ''}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Appointment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}