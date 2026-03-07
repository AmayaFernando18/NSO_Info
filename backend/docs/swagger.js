import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EDL Info API',
      version: '1.0.0',
      description: 'REST API for EDL Info intranet services.',
    },
    servers: [{ url: '/api', description: 'Relative API base' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js', './docs/schemas/*.js'],
});
