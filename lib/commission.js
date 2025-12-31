/**
 * Calculate commission for a sale
 * Commission = percentage of (sale price - trade-in value)
 */
export function calculateCommission(salePrice, tradeInValue = 0, commissionRate = 0.05) {
  try {
    const price = parseFloat(salePrice) || 0;
    const tradeIn = parseFloat(tradeInValue) || 0;
    const rate = parseFloat(commissionRate) || 0.05;

    if (price <= 0) {
      return 0;
    }

    const netAmount = price - tradeIn;
    const commission = netAmount * rate;

    return Math.max(0, commission);
  } catch (error) {
    console.error('Commission calculation error:', error);
    return 0;
  }
}

/**
 * Get commission tier based on sales performance
 */
export function getCommissionTier(totalSales) {
  const sales = parseFloat(totalSales) || 0;

  if (sales >= 500000) {
    return { tier: 'platinum', rate: 0.08, name: 'Platinum' };
  } else if (sales >= 250000) {
    return { tier: 'gold', rate: 0.06, name: 'Gold' };
  } else if (sales >= 100000) {
    return { tier: 'silver', rate: 0.05, name: 'Silver' };
  } else {
    return { tier: 'bronze', rate: 0.03, name: 'Bronze' };
  }
}

/**
 * Calculate total commission for multiple sales
 */
export function calculateTotalCommission(sales) {
  if (!Array.isArray(sales)) {
    return 0;
  }

  return sales.reduce((total, sale) => {
    const commission = calculateCommission(
      sale.sale_price,
      sale.trade_in_value
    );
    return total + commission;
  }, 0);
}

/**
 * Format commission amount
 */
export function formatCommission(amount) {
  const num = parseFloat(amount) || 0;
  return `$${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}