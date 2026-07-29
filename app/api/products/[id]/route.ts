import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection, initializeDatabase } from '../../../../lib/db';

function categorySlug(name: string) {
  const map: Record<string, string> = {
    'Birthday Gifts': 'birthday-gifts',
    'Anniversary Gifts': 'anniversary-gifts',
    'Wedding Gifts': 'wedding-gifts',
    'Corporate Gifts': 'corporate-gifts',
    'Personalized Gifts': 'personalized-gifts',
    'Home & Lifestyle': 'home-lifestyle',
    'Gift Hampers': 'festive-gift-hampers',
    'Festive Gift Hampers': 'festive-gift-hampers',
    'Utility Products': 'utility-products',
    'Car Accessories': 'car-accessories',
  };

  return map[name] || '';
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { status: 'error', message: 'A valid product id is required' },
        { status: 400 }
      );
    }

    await initializeDatabase();
    const db = await getDbConnection();
    const [rows] = await db.query(
      `SELECT p.id, p.title, p.description, p.price, p.stacks, p.status, c.name AS category_name, pi.image_path
       FROM products p
       LEFT JOIN category c ON c.id = p.category_id
       LEFT JOIN product_images pi ON pi.product_id = p.id
       WHERE p.id = ?
       ORDER BY pi.id ASC`,
      [productId]
    ) as [Array<Record<string, any>>, unknown];

    let product: Record<string, any> | null = null;

    for (const row of rows) {
      if (!product) {
        product = {
          id: Number(row.id),
          product_title: row.title || '',
          description_specifications: row.description || '',
          price: Number(row.price || 0),
          stacks: Number(row.stacks || 0),
          status: row.status || 'Active',
          category_name: row.category_name || '',
          category_slug: categorySlug(row.category_name || ''),
          image: '',
          images: [],
        };
      }

      if (row.image_path) {
        product.images.push(row.image_path);
        if (!product.image) {
          product.image = row.image_path;
        }
      }
    }

    if (!product) {
      return NextResponse.json(
        { status: 'error', message: 'Product not found' },
        { status: 404 }
      );
    }

    if (!product.image) {
      product.image = '/placeholder.svg';
    }
    if (!product.images.length) {
      product.images = ['/placeholder.svg'];
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error in GET /api/products/[id]:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Server exception occurred' },
      { status: 500 }
    );
  }
}
