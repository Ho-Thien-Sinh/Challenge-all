const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/database');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Test route
app.get('/test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({
      message: 'Database connection successful!',
      timestamp: result.rows[0].now
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database connection failed!' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 