const TARGET_ORIGIN = 'https://www.loreal-boutique.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, authorizer-appid',
  'Access-Control-Max-Age': '86400',
};

const withCors = (response) => {
  const headers = new Headers(response.headers);
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const targetUrl = new URL(url.pathname + url.search, TARGET_ORIGIN);

    let proxyRequest;
    try {
      proxyRequest = new Request(targetUrl.toString(), request);
    } catch (error) {
      return withCors(
        new Response(JSON.stringify({ message: 'Bad request', error: String(error) }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        })
      );
    }

    try {
      const response = await fetch(proxyRequest);
      return withCors(response);
    } catch (error) {
      return withCors(
        new Response(JSON.stringify({ message: 'Proxy error', error: String(error) }), {
          status: 502,
          headers: { 'content-type': 'application/json' },
        })
      );
    }
  },
};
