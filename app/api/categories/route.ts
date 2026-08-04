import { NextRequest, NextResponse } from 'next/server';

const PHP_ENDPOINTS = [
  process.env.PHP_CATEGORIES_API,
].filter(Boolean) as string[];

async function fetchFromPhp(queryString: string, options?: RequestInit) {
  let lastError: any = null;

  for (const endpoint of PHP_ENDPOINTS) {
    try {
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      const res = await fetch(url, {
        ...options,
        cache: 'no-store',
      });

      if (res.ok) {
        return res;
      }
      lastError = new Error(`PHP endpoint ${url} responded with status ${res.status}`);
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to connect to PHP categories backend');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams.toString();
    const res = await fetchFromPhp(searchParams, { method: 'GET' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in GET /api/categories (PHP proxy):', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to communicate with PHP categories backend' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.action) {
      body.action = 'CREATE';
    }
    const res = await fetchFromPhp('', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in POST /api/categories (PHP proxy):', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to communicate with PHP categories backend' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    body.action = 'UPDATE';
    const res = await fetchFromPhp('', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in PUT /api/categories (PHP proxy):', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to communicate with PHP categories backend' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    const body = { action: 'DELETE', id: Number(id) };
    const res = await fetchFromPhp('', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in DELETE /api/categories (PHP proxy):', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to communicate with PHP categories backend' },
      { status: 500 }
    );
  }
}

