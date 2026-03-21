import swaggerJSDoc from "swagger-jsdoc";
import fs from "fs";

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Quick Blush API - Comprehensive Collection",
      version: "1.0.0",
      description: "Full API documentation for Quick Blush properly exported for Postman",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
fs.writeFileSync("swagger.json", JSON.stringify(swaggerDocs, null, 2));
console.log("Swagger JSON generated successfully.");
