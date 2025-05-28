const express = require('express');
const app = express();
const path = require('path');

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Simple route for testing
app.get('/api/images', (req, res) => {
  res.json({
    success: true,
    message: 'Images API is working',
    images: [
      { name: 'cong-nghe.jpg', url: '/static/images/cong-nghe.jpg' },
      { name: 'kinh-doanh.jpg', url: '/static/images/kinh-doanh.jpg' }
    ]
  });
});

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});