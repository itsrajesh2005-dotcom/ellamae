import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection, initializeDatabase } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const db = await getDbConnection();
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search')?.trim() || '';
    
    let query = 'SELECT * FROM category ORDER BY id ASC';
    let params: any[] = [];
    
    if (search) {
      query = `
        SELECT * FROM category 
        WHERE name LIKE ? OR description LIKE ? 
        ORDER BY id ASC
      `;
      params = [`%${search}%`, `%${search}%`];
    }
    
    const [rows] = await db.query(query, params);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Server exception occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const db = await getDbConnection();
    
    const body = await request.json();
    const action = body.action || '';
    
    if (action === 'CREATE') {
      const name = body.name || '';
      const description = body.description || '';
      const status = body.status || 'Active';
      const banner_image = body.banner_image || '';
      
      if (!name) {
        return NextResponse.json(
          { status: 'error', message: 'Category Name is required' },
          { status: 400 }
        );
      }
      
      const [result]: any = await db.query(
        'INSERT INTO category (name, description, status, banner_image) VALUES (?, ?, ?, ?)',
        [name, description, status, banner_image]
      );
      
      return NextResponse.json({
        status: 'success',
        message: 'Category Added Successfully',
        id: result.insertId,
        name,
        description,
        status_val: status,
        banner_image
      });
    }
    
    if (action === 'UPDATE') {
      const id = parseInt(body.id || '0', 10);
      const name = body.name || '';
      const description = body.description || '';
      const status = body.status || 'Active';
      const banner_image = body.banner_image || '';
      
      if (id <= 0 || !name) {
        return NextResponse.json(
          { status: 'error', message: 'Category ID and Name are required' },
          { status: 400 }
        );
      }
      
      await db.query(
        'UPDATE category SET name = ?, description = ?, status = ?, banner_image = ? WHERE id = ?',
        [name, description, status, banner_image, id]
      );
      
      return NextResponse.json({
        status: 'success',
        message: 'Category Updated Successfully'
      });
    }
    
    if (action === 'DELETE') {
      const id = parseInt(body.id || '0', 10);
      
      if (id <= 0) {
        return NextResponse.json(
          { status: 'error', message: 'Invalid Category ID for deletion' },
          { status: 400 }
        );
      }
      
      await db.query('DELETE FROM category WHERE id = ?', [id]);
      
      return NextResponse.json({
        status: 'success',
        message: 'Category Deleted Successfully'
      });
    }
    
    return NextResponse.json(
      { status: 'error', message: 'Invalid Action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/categories:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Server exception occurred' },
      { status: 500 }
    );
  }
}
