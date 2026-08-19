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
      SELECT p.*, pi.image_path AS rel_image_path
      FROM products p 
      LEFT JOIN product_images pi ON p.id = pi.product_id 
    `;
    const params: any[] = [];
    
    const conditions: string[] = [];
    if (status && status !== 'all') {
      conditions.push('p.status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(p.title LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY p.id DESC';
    
    const [rows]: any = await db.query(query, params);
    
    const productsMap: Record<number, any> = {};
    for (const row of rows) {
      const pId = row.id;
      if (!productsMap[pId]) {
        productsMap[pId] = {
          id: row.id,
          category_id: row.category_id,
          brand_id: row.brand_id,
          title: row.title,
          price: row.price,
          stacks: row.stacks,
          description: row.description,
          status: row.status,
          display_id: `ELLAMAE${row.id}`,
          images: []
        };
        
        if (row.image_path) {
          productsMap[pId].images.push(row.image_path);
        }
      }
      
      if (row.rel_image_path && !productsMap[pId].images.includes(row.rel_image_path)) {
        productsMap[pId].images.push(row.rel_image_path);
      }
    }
    
    const processedRows = Object.values(productsMap).map((prod: any) => ({
      ...prod,
      image: prod.images.length > 0 ? prod.images[0] : null
    }));
    
    return NextResponse.json(processedRows);
  } catch (error: any) {
    console.error('Error in GET /api/products-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const db = await getDbConnection();
    
    const body = await request.json();
    const { category_id, brand_id, title, price, stacks, description, status, images } = body;
    
    // Auto-resolve category_id from the selected brand when the form omits it.
    let finalCategoryId = category_id ? Number(category_id) : null;
    if (brand_id) {
      const [brandRows]: any = await db.query(`
        SELECT COALESCE(b.category_id, MIN(bc.category_id)) AS category_id
        FROM brands b
        LEFT JOIN brand_categories bc ON b.id = bc.brand_id
        WHERE b.id = ?
        GROUP BY b.id
      `, [brand_id]);
      if (brandRows.length > 0 && brandRows[0].category_id) {
        finalCategoryId = Number(brandRows[0].category_id);
      }
    }
    
    if (!finalCategoryId) {
      return NextResponse.json(
        { status: 'error', message: 'Product must belong to a brand or category' },
        { status: 400 }
      );
    }
    
    const [result] = await db.query(
      'INSERT INTO products (category_id, brand_id, title, price, stacks, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [finalCategoryId, brand_id ? Number(brand_id) : null, title, price, stacks, description, status || 'Active']
    );
    
    const productId = (result as any).insertId;
    
    // Insert images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      for (const imagePath of images) {
        if (imagePath) {
          await db.query(
            'INSERT INTO product_images (product_id, image_path) VALUES (?, ?)',
            [productId, imagePath]
          );
        }
      }
    }
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Product created successfully',
      id: productId 
    });
  } catch (error: any) {
    console.error('Error in POST /api/products-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await initializeDatabase();
    const db = await getDbConnection();
    
    const body = await request.json();
    const { id, category_id, brand_id, title, price, stacks, description, status, images } = body;
    
    // Auto-resolve category_id from the selected brand when the form omits it.
    let finalCategoryId = category_id ? Number(category_id) : null;
    if (brand_id) {
      const [brandRows]: any = await db.query(`
        SELECT COALESCE(b.category_id, MIN(bc.category_id)) AS category_id
        FROM brands b
        LEFT JOIN brand_categories bc ON b.id = bc.brand_id
        WHERE b.id = ?
        GROUP BY b.id
      `, [brand_id]);
      if (brandRows.length > 0 && brandRows[0].category_id) {
        finalCategoryId = Number(brandRows[0].category_id);
      }
    }
    
    if (!finalCategoryId) {
      return NextResponse.json(
        { status: 'error', message: 'Product must belong to a brand or category' },
        { status: 400 }
      );
    }
    
    await db.query(
      'UPDATE products SET category_id = ?, brand_id = ?, title = ?, price = ?, stacks = ?, description = ?, status = ? WHERE id = ?',
      [finalCategoryId, brand_id ? Number(brand_id) : null, title, price, stacks, description, status, id]
    );
    
    // Update images - delete existing and insert new ones
    await db.query('DELETE FROM product_images WHERE product_id = ?', [id]);
    
    if (images && Array.isArray(images) && images.length > 0) {
      for (const imagePath of images) {
        if (imagePath) {
          await db.query(
            'INSERT INTO product_images (product_id, image_path) VALUES (?, ?)',
            [id, imagePath]
          );
        }
      }
    }
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Product updated successfully' 
    });
  } catch (error: any) {
    console.error('Error in PUT /api/products-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to update product' },
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
        { status: 'error', message: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    await db.query('DELETE FROM product_images WHERE product_id = ?', [id]);
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Product deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/products-db:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
