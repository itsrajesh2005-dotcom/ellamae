import {NextRequest, NextResponse} from "next/server";
const PHP_ENDPOINTS = [
  process.env.PHP_BRANDS_API,
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

  throw lastError || new Error('Failed to connect to PHP brands backend');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams.toString();
    const res = await fetchFromPhp(searchParams, { method: 'GET' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in GET /api/brands (PHP proxy):', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to communicate with PHP brands backend' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    console.error('Error in POST /api/brands (PHP proxy):', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to communicate with PHP brands backend' },
      { status: 500 }
    );
  }
}

