const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy cho API Tuổi Trẻ
  app.use(
    '/tuoitre',
    createProxyMiddleware({
      target: 'https://tuoitre.vn',
      changeOrigin: true,
      pathRewrite: {
        '^/tuoitre': ''
      },
      onProxyReq: (proxyReq, req, res) => {
        // Thêm các header cần thiết
        proxyReq.setHeader('Referer', 'https://tuoitre.vn');
        proxyReq.setHeader('Origin', 'https://tuoitre.vn');
      }
    })
  );

  // Proxy cho RSS
  app.use(
    '/rss',
    createProxyMiddleware({
      target: 'https://tuoitre.vn',
      changeOrigin: true,
      pathRewrite: {
        '^/rss': ''
      }
    })
  );

  // Proxy cho API Tuổi Trẻ (API chính)
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.tuoitre.vn',
      changeOrigin: true,
      pathRewrite: {
        '^/api': ''
      }
    })
  );
};
