const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the public directory
app.use('/static', express.static(path.join(__dirname, 'public')));

// Simple route for testing
app.get('/', (req, res) => {
  res.send('Server is running. Try accessing <a href="/static/test.html">test.html</a> or <a href="/static/images/cong-nghe.jpg">an image</a>.');
});

// Start the server
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});