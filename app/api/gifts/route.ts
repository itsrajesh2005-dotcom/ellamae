import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection, initializeDatabase } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const db = await getDbConnection();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || 'Active';
    const category_id = searchParams.get('category_id');
    
    // Strip "ELLAMAE" to search by ID
    const searchId = search.replace(/^ELLAMAE/i, '');
    
    let query = `
      SELECT g.id, g.category_id, g.title, g.price, g.stacks, g.description, g.status, g.image_path AS main_image, gi.image_path AS rel_image 
      FROM gifts g 
      LEFT JOIN gift_images gi ON g.id = gi.gift_id
    `;
    let params: any[] = [];
    let whereClauses: string[] = [];
    
    if (status !== 'all') {
      whereClauses.push('g.status = ?');
      params.push(status);
    }

    if (category_id) {
      whereClauses.push('g.category_id = ?');
      params.push(parseInt(category_id, 10));
    }
    
    if (search) {
      whereClauses.push('(g.title LIKE ? OR g.description LIKE ? OR g.id = ?)');
      params.push(`%${search}%`, `%${search}%`, searchId || -1);
    }
    
    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    query += ' ORDER BY g.id DESC';
    
    const [rows]: any[] = await db.query(query, params);
    
    // Group images by gift ID
    const giftsMap: Record<number, any> = {};
    for (const row of rows) {
      const giftId = row.id;
      if (!giftsMap[giftId]) {
        giftsMap[giftId] = {
          id: row.id,
          category_id: row.category_id,
          title: row.title,
          price: parseFloat(row.price || '0'),
          stacks: parseInt(row.stacks || '0', 10),
          description: row.description,
          status: row.status,
          display_id: `ELLAMAE${row.id}`,
          images: []
        };
        if (row.main_image) {
          giftsMap[giftId].images.push(row.main_image);
        }
      }
      if (row.rel_image && !giftsMap[giftId].images.includes(row.rel_image)) {
        giftsMap[giftId].images.push(row.rel_image);
      }
    }
    
    return NextResponse.json(Object.values(giftsMap));
  } catch (error: any) {
    console.error('Error in GET /api/gifts:', error);
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
      const category_id = parseInt(body.category_id || '0', 10);
      const title = body.title || '';
      const price = parseFloat(body.price || '0');
      const stacks = parseInt(body.stacks || '0', 10);
      const description = body.description || '';
      const status = body.status || 'Active';
      const images = body.images || []; // Array of Base64 strings
      const primaryImg = Array.isArray(images) && images.length > 0 ? images[0] : '';
      
      if (!title || category_id <= 0) {
        return NextResponse.json(
          { status: 'error', message: 'Title and Category are required' },
          { status: 400 }
        );
      }
      
      const [result]: any = await db.query(
        'INSERT INTO gifts (category_id, title, price, stacks, description, status, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [category_id, title, price, stacks, description, status, primaryImg]
      );
      
      const gift_id = result.insertId;
      
      // Insert images
      if (Array.isArray(images) && images.length > 0) {
        for (const img of images) {
          if (img) {
            await db.query(
              'INSERT INTO gift_images (gift_id, image_path) VALUES (?, ?)',
              [gift_id, img]
            );
          }
        }
      }
      
      return NextResponse.json({
        status: 'success',
        message: 'Gift Added Successfully',
        id: gift_id
      });
    }
    
    if (action === 'UPDATE') {
      const id = parseInt(body.id || '0', 10);
      let category_id = parseInt(body.category_id || '0', 10);
      const title = body.title || '';
      const price = parseFloat(body.price || '0');
      const stacks = parseInt(body.stacks || '0', 10);
      const description = body.description || '';
      const status = body.status || 'Active';
      const images = Array.isArray(body.images) ? body.images : [];
      
      if (category_id <= 0 && id > 0) {
        const [existing]: any = await db.query('SELECT category_id FROM gifts WHERE id = ?', [id]);
        if (existing && existing.length > 0) {
          category_id = existing[0].category_id;
        }
      }

      if (id <= 0 || !title || category_id <= 0) {
        return NextResponse.json(
          { status: 'error', message: 'Missing required update properties' },
          { status: 400 }
        );
      }
      
      const hasNewImages = images.length > 0;

      if (hasNewImages) {
        const primaryImg = images[0];
        await db.query(
          'UPDATE gifts SET category_id = ?, title = ?, price = ?, stacks = ?, description = ?, status = ?, image_path = ? WHERE id = ?',
          [category_id, title, price, stacks, description, status, primaryImg, id]
        );
        
        // Delete old images
        await db.query('DELETE FROM gift_images WHERE gift_id = ?', [id]);
        
        // Insert new images
        for (const img of images) {
          if (img) {
            await db.query(
              'INSERT INTO gift_images (gift_id, image_path) VALUES (?, ?)',
              [id, img]
            );
          }
        }
      } else {
        await db.query(
          'UPDATE gifts SET category_id = ?, title = ?, price = ?, stacks = ?, description = ?, status = ? WHERE id = ?',
          [category_id, title, price, stacks, description, status, id]
        );
      }
      
      return NextResponse.json({
        status: 'success',
        message: 'Gift Updated Successfully'
      });
    }
    
    if (action === 'DELETE') {
      const id = parseInt(body.id || '0', 10);
      
      if (id <= 0) {
        return NextResponse.json(
          { status: 'error', message: 'Invalid target tracking log ID' },
          { status: 400 }
        );
      }
      
      // InnoDB CASCADE constraint handles deleting images automatically
      await db.query('DELETE FROM gifts WHERE id = ?', [id]);
      
      return NextResponse.json({
        status: 'success',
        message: 'Gift Deleted Successfully'
      });
    }
    
    return NextResponse.json(
      { status: 'error', message: 'Invalid Action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/gifts:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Server exception occurred' },
      { status: 500 }
    );
  }
}
