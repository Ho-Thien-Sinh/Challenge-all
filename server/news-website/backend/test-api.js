const axios = require('axios');
const logger = require('./utils/logger');
const fs = require('fs'); // Import fs for file operations
const FormData = require('form-data'); // Assuming form-data library is used for FormData

const BASE_URL = 'http://localhost:5000/api/v1';
let authToken = null;

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Test@123'
};

const testArticle = {
  title: 'Test Article',
  content: 'This is a test article content',
  summary: 'Test summary',
  category: 'test',
  source: 'test',
  sourceUrl: 'https://test.com',
  imageUrl: '/test.jpg',
  publishedAt: new Date()
};

// Helper function để test API
async function testEndpoint(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    logger.info(`✅ ${method} ${endpoint} - Success:`, response.data);
    return response.data;
  } catch (error) {
    logger.error(`❌ ${method} ${endpoint} - Error:`, error.response?.data || error.message);
    return null;
  }
}

// Test Authentication APIs
async function testAuth() {
  logger.info('\n=== Testing Authentication APIs ===\n');

  // Test Register
  logger.info('Testing Register API...');
  // Note: This might fail if the user already exists. Consider adding a cleanup step or using a dynamic email.
  const registerResult = await testEndpoint('POST', '/auth/register', testUser);
  // If registration fails because user exists, try logging in directly
  if (!registerResult?.success && registerResult?.message === 'Email đã được sử dụng') {
      logger.info('User already exists, skipping registration and trying login.');
  } else if (!registerResult?.success) {
      logger.error('Register test failed');
      return;
  }

  // Test Login
  logger.info('\nTesting Login API...');
  const loginResult = await testEndpoint('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  
  if (loginResult?.success) {
    authToken = loginResult.data.token;
    logger.info('Login successful, got auth token');
  } else {
    logger.error('Login test failed');
    return;
  }

  // Test Get Current User
  logger.info('\nTesting Get Current User API...');
  await testEndpoint('GET', '/auth/me', null, authToken);
}

// Test Articles APIs
async function testArticles() {
  logger.info('\n=== Testing Articles APIs ===\n');

  // Ensure authenticated for these tests
  if (!authToken) {
      logger.warn('Auth token not available. Running authentication tests first...');
      await testAuth();
      if (!authToken) {
          logger.error('Failed to obtain auth token. Cannot run Articles tests.');
          return;
      }
  }

  // Test Get Articles List
  logger.info('Testing Get Articles List API...');
  await testEndpoint('GET', '/articles');

  // Test Create Article
  logger.info('\nTesting Create Article API...');
  const createResult = await testEndpoint('POST', '/articles', testArticle, authToken);
  if (!createResult?.success) {
    logger.error('Create article test failed');
    // Continue with other tests if creation failed (e.g., due to permissions or data issues)
    // return;
  } else {
    const articleId = createResult.data.id;

    // Test Get Article Detail
    logger.info('\nTesting Get Article Detail API...');
    await testEndpoint('GET', `/articles/${articleId}`);

    // Test Update Article
    logger.info('\nTesting Update Article API...');
    await testEndpoint('PUT', `/articles/${articleId}`, {
      ...testArticle,
      title: 'Updated Test Article'
    }, authToken);

    // Test Delete Article
    logger.info('\nTesting Delete Article API...');
    await testEndpoint('DELETE', `/articles/${articleId}`, null, authToken);
  }
}

// Test Images APIs
async function testImages() {
  logger.info('\n=== Testing Images APIs ===\n');

   // Ensure authenticated for these tests
   if (!authToken) {
      logger.warn('Auth token not available. Running authentication tests first...');
      await testAuth();
       if (!authToken) {
          logger.error('Failed to obtain auth token. Cannot run Images tests.');
          return;
      }
  }

  // Test Get Images List
  logger.info('Testing Get Images List API...');
  await testEndpoint('GET', '/images');

  // Test Upload Image (using FormData)
  logger.info('\nTesting Upload Image API...');
  const testImagePath = './test-image.jpg'; // Path to a dummy image file
  
  // Create a dummy image file if it doesn't exist
  if (!fs.existsSync(testImagePath)) {
      logger.info(`Creating dummy image file: ${testImagePath}`);
      // A simple way to create a dummy binary file - adjust size if needed
      fs.writeFileSync(testImagePath, Buffer.from([71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 0, 0, 0, 255, 255, 255, 33, 249, 4, 1, 0, 0, 0, 0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 76, 1, 0, 59])); // 1x1 transparent GIF
  }

  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));

    const response = await axios.post(`${BASE_URL}/images/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`
      }
    });

    logger.info('✅ POST /images/upload - Success:', response.data);
    const imageFilename = response.data.data.filename;

    // Test Delete Image
    logger.info('\nTesting Delete Image API...');
    await testEndpoint('DELETE', `/images/${imageFilename}`, null, authToken);

    // Clean up the dummy image file
    // fs.unlinkSync(testImagePath); // Keep the file for potential manual inspection or future runs

  } catch (error) {
    logger.error('❌ Image upload/delete test failed:', error.message);
  }
}

// Test Crawler APIs
async function testCrawler() {
  logger.info('\n=== Testing Crawler APIs ===\n');

   // Ensure authenticated for these tests (crawler run requires admin)
   if (!authToken) {
      logger.warn('Auth token not available. Running authentication tests first...');
      await testAuth();
       if (!authToken) {
          logger.error('Failed to obtain auth token. Cannot run Crawler tests.');
          return;
      }
  }

  // Test Get Crawler Status
  logger.info('Testing Get Crawler Status API...');
  await testEndpoint('GET', '/crawler/status');

  // Test Manual Crawl
  // Note: This requires the authenticated user to be an admin.
  logger.info('\nTesting Manual Crawl API...');
  await testEndpoint('POST', '/crawler/run?limit=5', null, authToken);
}

// --- Main execution logic --- //
const args = process.argv.slice(2);
const testToRun = args[0];

async function runSpecificTest(testName) {
    switch (testName) {
        case 'auth':
            await testAuth();
            break;
        case 'articles':
            await testArticles();
            break;
        case 'images':
            await testImages();
            break;
        case 'crawler':
            await testCrawler();
            break;
        case undefined: // No argument, run all
            await testAuth();
            await testArticles();
            await testImages();
            await testCrawler();
            break;
        default:
            logger.error(`Invalid test name: ${testName}. Available tests: auth, articles, images, crawler`);
    }
}

runSpecificTest(testToRun); 