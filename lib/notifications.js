/**
 * Generate notification message for lead follow-up
 */
export function generateFollowUpMessage(lead) {
  return `Follow-up reminder for ${lead.contact_name}. 
Vehicle Interest: ${lead.vehicle_interested || 'Not specified'}. 
Contact: ${lead.contact_phone}`;
}

/**
 * Generate notification message for sale delivery
 */
export function generateDeliveryReminderMessage(sale) {
  return `Delivery scheduled for ${sale.customer_name}. 
Vehicle: ${sale.vehicle_info}. 
Delivery Date: ${new Date(sale.delivery_date).toLocaleDateString()}`;
}

/**
 * Check if notification should be sent (24 hours before scheduled date)
 */
export function shouldSendNotification(scheduledDate) {
  const now = new Date();
  const scheduled = new Date(scheduledDate);
  const hoursDifference = (scheduled - now) / (1000 * 60 * 60);
  
  // Send notification if within 24 hours and not past due
  return hoursDifference <= 24 && hoursDifference >= 0;
}

/**
 * Get notification priority based on type
 */
export function getNotificationPriority(type) {
  const priorities = {
    'follow-up': 'medium',
    'delivery': 'high',
    'appointment': 'high',
    'payment-due': 'high',
    'general': 'low',
  };
  
  return priorities[type] || 'medium';
}

/**
 * Format notification for display
 */
export function formatNotification(notification) {
  return {
    id: notification.id,
    title: getNotificationTitle(notification.type),
    message: notification.message,
    priority: getNotificationPriority(notification.type),
    scheduledDate: new Date(notification.scheduled_date).toLocaleString(),
    sent: notification.sent,
  };
}

function getNotificationTitle(type) {
  const titles = {
    'follow-up': 'Follow-up Reminder',
    'delivery': 'Delivery Reminder',
    'appointment': 'Appointment Reminder',
    'payment-due': 'Payment Due',
    'general': 'Notification',
  };
  
  return titles[type] || 'Notification';
}

/**
 * Schedule automatic notifications for a lead
 */
export function scheduleLeadNotifications(lead) {
  const notifications = [];
  
  if (lead.follow_up_date) {
    const followUpDate = new Date(lead.follow_up_date);
    const reminderDate = new Date(followUpDate);
    reminderDate.setHours(reminderDate.getHours() - 24);
    
    notifications.push({
      type: 'follow-up',
      message: generateFollowUpMessage(lead),
      scheduled_date: reminderDate.toISOString(),
      lead_id: lead.id,
    });
  }
  
  return notifications;
}

/**
 * Schedule automatic notifications for a sale
 */
export function scheduleSaleNotifications(sale) {
  const notifications = [];
  
  if (sale.delivery_date) {
    const deliveryDate = new Date(sale.delivery_date);
    const reminderDate = new Date(deliveryDate);
    reminderDate.setHours(reminderDate.getHours() - 24);
    
    notifications.push({
      type: 'delivery',
      message: generateDeliveryReminderMessage(sale),
      scheduled_date: reminderDate.toISOString(),
    });
  }
  
  return notifications;
}