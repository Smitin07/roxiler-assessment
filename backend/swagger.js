const swaggerJsdoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Roxiler Store Rating API",
      version: "1.0.0",
      description: "Roxiler Full Stack Developer Assessment API"
    },

    servers: [
      {
        url: "http://localhost:3000"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },

  apis: [
    "./routes/*.js"
  ]
});

module.exports = swaggerSpec;