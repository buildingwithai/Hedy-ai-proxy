const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (req, res) => {
  // Remove the /api prefix that Vercel adds
  const targetPath = req.url.replace(/^\/api/, '');
  
  const proxy = createProxyMiddleware({
    target: 'https://rapid-mcp.com',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '' // Remove /api from the path
    },
    onProxyReq: (proxyReq) => {
      // Add the authorization header
      proxyReq.setHeader('api-key', `Bearer ${process.env.HEDY_API_KEY}`);
      // Set the correct host header
      proxyReq.setHeader('host', 'rapid-mcp.com');
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).json({ error: 'Proxy error', details: err.message });
    }
  });

  // Remove the Content-Type header to let the proxy set it
  res.removeHeader('Content-Type');
  
  return proxy(req, res, (err) => {
    if (err) {
      console.error('Proxy error:', err);
      res.status(500).json({ error: 'Proxy error', details: err.message });
    }
  });
};

// For Vercel Serverless Functions
export default (req, res) => module.exports(req, res);
