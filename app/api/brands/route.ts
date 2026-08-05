import { NextRequest, NextResponse } from 'next/server';

function buildPhpEndpoints(request: NextRequest, phpPath: string) {
  const endpoints: string[] = [];

  if (process.env.PHP_BRANDS_API) endpoints.push(process.env.PHP_BRANDS_API);

  if (process.env.NEXT_PUBLIC_PHP_BACKEND_URL) {
    endpoints.push(`${process.env.NEXT_PUBLIC_PHP_BACKEND_URL.replace(/\/$/, '')}/${phpPath}`);
  }

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (host) {
    const hostname = host.split(':')[0];
    const proto = (request.headers.get('x-forwarded-proto') || 'http').replace(/:\/\//, '');
    endpoints.push(`${proto}://${hostname}/luxury-backend/${phpPath}`);
  }

  return endpoints.filter(Boolean);
}

async function fetchFromPhp(request: NextRequest, phpPath: string, queryString: string, options?: RequestInit) {
  const endpoints = buildPhpEndpoints(request, phpPath);
  let lastError: any = null;

  for (const endpoint of endpoints) {
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

async function safeParsePhpJson(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (primaryError) {
    const firstJsonCharIndex = text.search(/[\[{]/);
    if (firstJsonCharIndex === -1) {
      console.error('Brands PHP response contains no JSON payload:', text);
      return null;
    }

    const candidate = text.slice(firstJsonCharIndex);
    try {
      return JSON.parse(candidate);
    } catch (secondaryError) {
      console.error('Failed to parse brands PHP JSON response:', {
        primaryError,
        secondaryError,
        responseText: text,
        jsonCandidate: candidate,
      });
      return null;
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams.toString();
    const res = await fetchFromPhp(request, 'manage-brands.php', searchParams, { method: 'GET' });
    const data = await safeParsePhpJson(res);
    return NextResponse.json(data ?? []);
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
    const res = await fetchFromPhp(request, 'manage-brands.php', '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await safeParsePhpJson(res);
    return NextResponse.json(data ?? { status: 'error', message: 'Invalid PHP response' });
  } catch (error: any) {
    console.error('Error in POST /api/brands (PHP proxy):', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to communicate with PHP brands backend' },
      { status: 500 }
    );
  }
}

