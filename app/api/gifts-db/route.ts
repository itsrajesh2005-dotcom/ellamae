import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection, initializeDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const db = await getDbConnection();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    let query = `
      SELECT g.*, 
        GROUP_CONCAT(DISTINCT gi.image_path ORDER BY gi.id SEPARATOR ',') as images
      FROM gifts g 
      LEFT JOIN gift_images gi ON g.id = gi.gift_id 
    `;
    const params: any[] = [];
    
    const conditions: string[] = [];
    if (status && status !== 'all') {
      conditions.push('g.status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(g.title LIKE ? OR g.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY g.id ORDER BY g.id DESC';
    
    const [rows] = await db.query(query, params);
    
    // Parse the images string back into an array
    const processedRows = (rows as any[]).map((row: any) => ({
      ...row,
      images: row.images ? row.images.split(',') : [],
      image: row.images ? row.images.split(',')[0] : null
    }));
    
    return NextResponse.json(processedRows);
  } catch (error: any) {
    console.error('Error in GET /api/gifts-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to fetch gifts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const db = await getDbConnection();
    
    const body = await request.json();
    const { category_id, title, price, stacks, description, status, images } = body;
    
    const [result] = await db.query(
      'INSERT INTO gifts (category_id, title, price, stacks, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [category_id, title, price, stacks, description, status || 'Active']
    );
    
    const giftId = (result as any).insertId;
    
    // Insert images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      for (const imagePath of images) {
        if (imagePath) {
          await db.query(
            'INSERT INTO gift_images (gift_id, image_path) VALUES (?, ?)',
            [giftId, imagePath]
          );
        }
      }
    }
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Gift created successfully',
      id: giftId 
    });
  } catch (error: any) {
    console.error('Error in POST /api/gifts-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to create gift' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await initializeDatabase();
    const db = await getDbConnection();
    
    const body = await request.json();
    const { id, category_id, title, price, stacks, description, status, images } = body;
    
    await db.query(
      'UPDATE gifts SET category_id = ?, title = ?, price = ?, stacks = ?, description = ?, status = ? WHERE id = ?',
      [category_id, title, price, stacks, description, status, id]
    );
    
    // Update images - delete existing and insert new ones
    await db.query('DELETE FROM gift_images WHERE gift_id = ?', [id]);
    
    if (images && Array.isArray(images) && images.length > 0) {
      for (const imagePath of images) {
        if (imagePath) {
          await db.query(
            'INSERT INTO gift_images (gift_id, image_path) VALUES (?, ?)',
            [id, imagePath]
          );
        }
      }
    }
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Gift updated successfully' 
    });
  } catch (error: any) {
    console.error('Error in PUT /api/gifts-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to update gift' },
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
        { status: 'error', message: 'Gift ID is required' },
        { status: 400 }
      );
    }
    
    await db.query('DELETE FROM gift_images WHERE gift_id = ?', [id]);
    await db.query('DELETE FROM gifts WHERE id = ?', [id]);
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Gift deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/gifts-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to delete gift' },
      { status: 500 }
    );
  }
}
