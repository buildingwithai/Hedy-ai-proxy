import { createProxyMiddleware } from 'http-proxy-middleware';

export default function handler(req, res) {
  const proxy = createProxyMiddleware({
    target: 'https://rapid-mcp.com',
    changeOrigin: true,
    pathRewrite: { '^/api/proxy': '' },
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader('api-key', `Bearer ${process.env.HEDY_API_KEY}`);
    }
  });

  return new Promise((resolve, reject) => {
    proxy(req, res, (err) => {
      if (err) {
        console.error('Proxy error:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
