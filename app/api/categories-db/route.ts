import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection, initializeDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const db = await getDbConnection();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    let query = `
      SELECT c.* 
      FROM category c
    `;
    const params: any[] = [];
    
    const conditions: string[] = [];
    if (status && status !== 'all') {
      conditions.push('c.status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(c.name LIKE ? OR c.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY id DESC';
    
    const [rows] = await db.query(query, params);
    
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error in GET /api/categories-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to fetch categories' },
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
      'INSERT INTO category (name, description, status, banner_image) VALUES (?, ?, ?, ?)',
      [name, description, status || 'Active', banner_image || null]
    );
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Category created successfully',
      id: (result as any).insertId 
    });
  } catch (error: any) {
    console.error('Error in POST /api/categories-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to create category' },
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
      'UPDATE category SET name = ?, description = ?, status = ?, banner_image = ? WHERE id = ?',
      [name, description, status, banner_image || null, id]
    );
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Category updated successfully' 
    });
  } catch (error: any) {
    console.error('Error in PUT /api/categories-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to update category' },
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
        { status: 'error', message: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    await db.query('DELETE FROM category WHERE id = ?', [id]);
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Category deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/categories-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}
