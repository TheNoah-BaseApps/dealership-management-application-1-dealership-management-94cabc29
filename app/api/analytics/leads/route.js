/**
 * @swagger
 * /api/analytics/leads:
 *   get:
 *     summary: Get lead analytics
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

    // Get lead source performance
    const sourceResult = await query(
      `SELECT lead_source as source, COUNT(*) as count
       FROM leads
       GROUP BY lead_source
       ORDER BY count DESC`,
      []
    );

    return NextResponse.json({
      success: true,
      data: {
        sources: sourceResult.rows,
      },
    });
  } catch (error) {
    console.error('Get lead analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}