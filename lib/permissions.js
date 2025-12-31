export function canAccessLeads(role) {
  const allowedRoles = ['admin', 'manager', 'salesperson'];
  return allowedRoles.includes(role);
}

export function canAccessSales(role) {
  const allowedRoles = ['admin', 'manager', 'salesperson', 'finance'];
  return allowedRoles.includes(role);
}

export function canAccessCustomers(role) {
  const allowedRoles = ['admin', 'manager', 'salesperson', 'finance'];
  return allowedRoles.includes(role);
}

export function canAccessVehicles(role) {
  const allowedRoles = ['admin', 'manager', 'salesperson'];
  return allowedRoles.includes(role);
}

export function canAccessAnalytics(role) {
  const allowedRoles = ['admin', 'manager'];
  return allowedRoles.includes(role);
}

export function canAccessUsers(role) {
  const allowedRoles = ['admin', 'manager'];
  return allowedRoles.includes(role);
}

export function canModifyUser(currentUser, targetUserId) {
  // Users can modify their own profile, admins can modify anyone
  return currentUser.userId === targetUserId || currentUser.role === 'admin';
}

export function canDeleteLead(user) {
  const allowedRoles = ['admin', 'manager'];
  return allowedRoles.includes(user.role);
}

export function canDeleteSale(user) {
  const allowedRoles = ['admin', 'manager'];
  return allowedRoles.includes(user.role);
}

export function canAssignLeads(role) {
  const allowedRoles = ['admin', 'manager'];
  return allowedRoles.includes(role);
}