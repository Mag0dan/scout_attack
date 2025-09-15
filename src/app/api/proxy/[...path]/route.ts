import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

// Create custom agent that ignores SSL certificate errors in development
const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV !== 'development'
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PATCH');
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/');
    const serverUrl = process.env.SERVER_URL || 'https://83.220.170.171';
    const targetUrl = `${serverUrl}/api/${path}`;

    // Get search params from original request
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${targetUrl}?${searchParams}` : targetUrl;

    // Prepare headers
    const headers: Record<string, string> = {};

    // Copy relevant headers from original request
    const headersToProxy = [
      'content-type',
      'authorization',
      'cookie',
      'user-agent',
      'accept',
      'accept-language',
      'accept-encoding'
    ];

    headersToProxy.forEach(header => {
      const value = request.headers.get(header);
      if (value) {
        headers[header] = value;
      }
    });

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
      // @ts-ignore - Node.js specific agent option
      agent: httpsAgent,
    };

    // Add body for methods that support it
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const body = await request.text();
        if (body) {
          requestOptions.body = body;
        }
      } catch (error) {
        console.error('Error reading request body:', error);
      }
    }

    // Make the proxied request
    const response = await fetch(fullUrl, requestOptions);

    // Get response body
    const responseBody = await response.text();

    // Prepare response headers
    const responseHeaders = new Headers();

    // Copy response headers (excluding some that shouldn't be proxied)
    const headersToExclude = [
      'content-encoding',
      'content-length',
      'transfer-encoding',
      'connection',
      'upgrade',
      'access-control-allow-origin',
      'access-control-allow-credentials',
      'access-control-allow-methods',
      'access-control-allow-headers'
    ];

    response.headers.forEach((value, key) => {
      if (!headersToExclude.includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    // Add CORS headers for browser
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Credentials', 'true');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    },
  });
}