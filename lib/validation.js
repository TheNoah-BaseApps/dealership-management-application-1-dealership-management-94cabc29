export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  if (!password || password.length < 6) {
    return {
      valid: false,
      error: 'Password must be at least 6 characters long'
    };
  }
  return { valid: true };
}

export function validatePhone(phone) {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
}

export function validateVIN(vin) {
  // VIN must be exactly 17 alphanumeric characters
  if (!vin || vin.length !== 17) {
    return {
      valid: false,
      error: 'VIN must be exactly 17 characters'
    };
  }
  
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  if (!vinRegex.test(vin)) {
    return {
      valid: false,
      error: 'VIN contains invalid characters'
    };
  }
  
  return { valid: true };
}

export function validateLeadStatus(status) {
  const validStatuses = ['new', 'contacted', 'qualified', 'negotiating', 'won', 'lost'];
  return validStatuses.includes(status?.toLowerCase());
}

export function validateSaleStatus(status) {
  const validStatuses = ['pending', 'financing', 'approved', 'delivered', 'completed'];
  return validStatuses.includes(status?.toLowerCase());
}

export function validateFutureDate(date) {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return inputDate >= today;
}

export function validatePositiveNumber(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}