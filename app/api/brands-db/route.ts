import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection, initializeDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const db = await getDbConnection();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    let query = 'SELECT * FROM brands';
    const params: any[] = [];
    
    const conditions: string[] = [];
    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY id DESC';
    
    const [rows] = await db.query(query, params);
    
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error in GET /api/brands-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const db = await getDbConnection();
    
    const body = await request.json();
    const { name, description, status, banner_image } = body;
    
    const [result] = await db.query(
      'INSERT INTO brands (name, description, status, banner_image) VALUES (?, ?, ?, ?)',
      [name, description, status || 'Active', banner_image || null]
    );
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Brand created successfully',
      id: (result as any).insertId 
    });
  } catch (error: any) {
    console.error('Error in POST /api/brands-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to create brand' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await initializeDatabase();
    const db = await getDbConnection();
    
    const body = await request.json();
    const { id, name, description, status, banner_image } = body;
    
    await db.query(
      'UPDATE brands SET name = ?, description = ?, status = ?, banner_image = ? WHERE id = ?',
      [name, description, status, banner_image || null, id]
    );
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Brand updated successfully' 
    });
  } catch (error: any) {
    console.error('Error in PUT /api/brands-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to update brand' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await initializeDatabase();
    const db = await getDbConnection();
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Brand ID is required' },
        { status: 400 }
      );
    }
    
    await db.query('DELETE FROM brands WHERE id = ?', [id]);
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Brand deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/brands-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to delete brand' },
      { status: 500 }
    );
  }
}