/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get dashboard metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get total leads
    const totalLeadsResult = await query(
      'SELECT COUNT(*) as count FROM leads',
      []
    );
    const totalLeads = parseInt(totalLeadsResult.rows[0]?.count || 0);

    // Get conversion rate
    const conversionResult = await query(
      `SELECT 
        COUNT(CASE WHEN lead_status = 'won' THEN 1 END) as won,
        COUNT(*) as total
       FROM leads`,
      []
    );
    const conversionRate = conversionResult.rows[0]?.total > 0
      ? ((conversionResult.rows[0]?.won / conversionResult.rows[0]?.total) * 100).toFixed(1)
      : 0;

    // Get sales this month
    const salesThisMonthResult = await query(
      `SELECT COALESCE(SUM(sale_price), 0) as total
       FROM sales
       WHERE EXTRACT(MONTH FROM sale_date) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR FROM sale_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
      []
    );
    const salesThisMonth = parseFloat(salesThisMonthResult.rows[0]?.total || 0);

    // Get pending deliveries
    const pendingDeliveriesResult = await query(
      `SELECT COUNT(*) as count
       FROM sales
       WHERE sale_status IN ('pending', 'approved', 'financing')`,
      []
    );
    const pendingDeliveries = parseInt(pendingDeliveriesResult.rows[0]?.count || 0);

    return NextResponse.json({
      success: true,
      data: {
        totalLeads,
        conversionRate,
        salesThisMonth,
        pendingDeliveries,
        leadsChange: 0,
        conversionChange: 0,
        salesChange: 0,
      },
    });
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}