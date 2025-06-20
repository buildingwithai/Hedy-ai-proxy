// Edge Function for Hedy MCP Proxy
export const config = {
  runtime: 'edge',
  regions: ['iad1']  // Deploy to Washington, D.C. region
};

export default async function handler(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    // Get the URL path
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api/, '');
    
    // Create the target URL
    const targetUrl = new URL(`https://rapid-mcp.com${path}${url.search || ''}`);
    
    // Prepare headers
    const headers = new Headers(request.headers);
    headers.set('api-key', `Bearer ${process.env.HEDY_API_KEY || ''}`);
    headers.set('host', 'rapid-mcp.com');
    
    // Forward the request
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' 
        ? request.body 
        : undefined,
    });

    // Prepare response headers
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Proxy error', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }), 
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
