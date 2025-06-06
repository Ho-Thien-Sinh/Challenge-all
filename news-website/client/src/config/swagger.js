const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blog API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Blog application',
    },
    servers: [
      {
        url: 'http://localhost:3000/api', // Adjust port if needed
      },
    ],
  },
  apis: ['./src/models/*.js', './src/routes/*.js', './src/controllers/*.js'], // Paths to files containing Swagger annotations
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec; 