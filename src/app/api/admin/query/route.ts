import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getSession } from '@/utils/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 },
      );
    }

    // Security: Only allow SELECT queries
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery.startsWith('select')) {
      return NextResponse.json(
        { error: 'Only SELECT queries are allowed' },
        { status: 400 },
      );
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const result = await pool.query(query);

    await pool.end();

    return NextResponse.json({
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields.map(field => ({
        name: field.name,
        dataTypeID: field.dataTypeID,
      })),
    });
  } catch (error: any) {
    console.error('Query error:', error);
    return NextResponse.json(
      { error: error.message || 'Query failed' },
      { status: 500 },
    );
  }
}
