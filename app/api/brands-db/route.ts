import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection, initializeDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 1. GET Function - Fetches all brands or filters by Category
export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const db = await getDbConnection();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const categoryId = searchParams.get('category_id');
    
    // Select brands and also check multi-category junction table if present
    let query = `
      SELECT b.*, 
             GROUP_CONCAT(bc.category_id) AS category_ids
      FROM brands b
      LEFT JOIN brand_categories bc ON b.id = bc.brand_id
    `;
    
    const params: any[] = [];
    const conditions: string[] = [];

    // Filter by Status (Active / Inactive)
    if (status && status !== 'all') {
      conditions.push('b.status = ?');
      params.push(status);
    }

    // Filter by Search text
    if (search) {
      conditions.push('(b.name LIKE ? OR b.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    // Category Filter Logic:
    // Fetch if matching category_id OR category_id IS NULL ("All Categories") OR mapped in junction table
    if (categoryId && categoryId !== 'all' && categoryId !== '') {
      conditions.push('(b.category_id = ? OR b.category_id IS NULL OR bc.category_id = ?)');
      params.push(categoryId, categoryId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY b.id ORDER BY b.id DESC';
    
    const [rows]: any = await db.query(query, params);
    
    // Format response to ensure backward compatibility
    const formattedRows = rows.map((row: any) => {
      const junctionCatIds = row.category_ids ? row.category_ids.split(',').map(Number) : [];
      
      // If brand has explicit category_id column value, include it
      if (row.category_id !== null && row.category_id !== undefined) {
        if (!junctionCatIds.includes(Number(row.category_id))) {
          junctionCatIds.push(Number(row.category_id));
        }
      }

      return {
        ...row,
        category_ids: junctionCatIds,
        // If category_id is null, it acts as All Categories
        is_all_categories: row.category_id === null
      };
    });
    
    return NextResponse.json(formattedRows);
  } catch (error: any) {
    console.error('Error in GET /api/brands-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

// 2. POST Function - Creates a new Brand
export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const db = await getDbConnection();
    
    const body = await request.json();
    const { name, description, status, banner_image, category_id, category_ids } = body;

    // Handle Category ID: If "all" or empty, set category_id as NULL
    let finalCategoryId = category_id;
    if (category_id === 'all' || category_id === '' || category_id === undefined) {
      finalCategoryId = null;
    }

    const [result]: any = await db.query(
      'INSERT INTO brands (name, description, status, banner_image, category_id) VALUES (?, ?, ?, ?, ?)',
      [name, description, status || 'Active', banner_image || null, finalCategoryId]
    );
    
    const brandId = result.insertId;

    // Save in junction table if multiple categories array is passed
    if (Array.isArray(category_ids) && category_ids.length > 0) {
      const values = category_ids.map((cId: number) => [brandId, cId]);
      await db.query(
        'INSERT IGNORE INTO brand_categories (brand_id, category_id) VALUES ?',
        [values]
      );
    } else if (finalCategoryId !== null) {
      await db.query(
        'INSERT IGNORE INTO brand_categories (brand_id, category_id) VALUES (?, ?)',
        [brandId, finalCategoryId]
      );
    }
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Brand created successfully',
      id: brandId 
    });
  } catch (error: any) {
    console.error('Error in POST /api/brands-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to create brand' },
      { status: 500 }
    );
  }
}

// 3. PUT Function - Updates an existing Brand
export async function PUT(request: NextRequest) {
  try {
    await initializeDatabase();
    const db = await getDbConnection();
    
    const body = await request.json();
    const { id, name, description, status, banner_image, category_id, category_ids } = body;

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Brand ID is required' },
        { status: 400 }
      );
    }

    // Handle "All Categories" selection
    let finalCategoryId = category_id;
    if (category_id === 'all' || category_id === '' || category_id === undefined) {
      finalCategoryId = null;
    }

    await db.query(
      'UPDATE brands SET name = ?, description = ?, status = ?, banner_image = ?, category_id = ? WHERE id = ?',
      [name, description, status, banner_image || null, finalCategoryId, id]
    );

    // Refresh junction mappings if junction table exists
    try {
      await db.query('DELETE FROM brand_categories WHERE brand_id = ?', [id]);

      if (Array.isArray(category_ids) && category_ids.length > 0) {
        const values = category_ids.map((cId: number) => [id, cId]);
        await db.query(
          'INSERT IGNORE INTO brand_categories (brand_id, category_id) VALUES ?',
          [values]
        );
      } else if (finalCategoryId !== null) {
        await db.query(
          'INSERT IGNORE INTO brand_categories (brand_id, category_id) VALUES (?, ?)',
          [id, finalCategoryId]
        );
      }
    } catch (e) {
      // Junction table optional fallback
    }
    
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

// 4. DELETE Function - Deletes a Brand
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