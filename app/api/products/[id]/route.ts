import { NextRequest, NextResponse } from 'next/server';

function buildPhpEndpoints(request: NextRequest) {
  const endpoints: string[] = [];

  if (process.env.PHP_PRODUCTS_API) {
    const base = process.env.PHP_PRODUCTS_API.substring(
      0,
      process.env.PHP_PRODUCTS_API.lastIndexOf('/')
    );
    endpoints.push(`${base}/get_product_detail.php`);
  }

  if (process.env.NEXT_PUBLIC_PHP_BACKEND_URL) {
    endpoints.push(
      `${process.env.NEXT_PUBLIC_PHP_BACKEND_URL.replace(/\/$/, '')}/get_product_detail.php`
    );
  }

  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host');

  if (host) {
    const hostname = host.split(':')[0];
    const proto = (
      request.headers.get('x-forwarded-proto') || 'http'
    ).replace(/:\/\//, '');

    endpoints.push(
      `${proto}://${hostname}/luxury-backend/get_product_detail.php`
    );
  }

  return [...new Set(endpoints)];
}

async function fetchProductFromPhp(
  request: NextRequest,
  id: string
) {
  const endpoints = buildPhpEndpoints(request);

  let lastError: unknown = null;

  for (const endpoint of endpoints) {
    try {
      const url = `${endpoint}?id=${encodeURIComponent(id)}`;

      console.log(`Fetching product ${id} from PHP: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
      });

      if (response.ok) {
        return response;
      }

      const body = await response.text();

      lastError = new Error(
        `PHP endpoint returned ${response.status}: ${body}`
      );
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to connect to PHP product backend');
}

async function parsePhpResponse(response: Response) {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error('PHP backend returned an empty response');
  }

  try {
    return JSON.parse(text);
  } catch {
    console.error('Invalid JSON returned by PHP backend:', text);

    throw new Error('PHP backend returned invalid JSON');
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const productId = Number(id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'A valid product id is required',
        },
        { status: 400 }
      );
    }

    const response = await fetchProductFromPhp(
      request,
      String(productId)
    );

    const data = await parsePhpResponse(response);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(
      'Error in GET /api/products/[id] PHP proxy:',
      error
    );

    return NextResponse.json(
      {
        status: 'error',
        message:
          error?.message ||
          'Failed to communicate with PHP product backend',
      },
      { status: 500 }
    );
  }
}