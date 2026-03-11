const swaggerJSDoc = require("swagger-jsdoc");
const fs = require("fs");

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Quick Blush API Interface",
      version: "1.0.0",
      description: "API Documentation for Quick Blush backend platform",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
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

// Generate Postman Collection v2.1.0 format
const postmanCollection = {
  info: {
    name: "Quick Blush Postman Collection",
    description: "Auto-generated collection from Swagger docs",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  item: []
};

// Group by tags
const groups = {};

for (const [path, methods] of Object.entries(swaggerDocs.paths)) {
  for (const [method, entry] of Object.entries(methods)) {
    const tag = (entry.tags && entry.tags.length > 0) ? entry.tags[0] : "Default";
    if (!groups[tag]) groups[tag] = [];

    // Parse URL vars
    const urlVars = [];
    let formattedPath = path.replace(/\{([^}]+)\}/g, (match, p1) => {
      urlVars.push({ key: p1, value: `{{${p1}}}` });
      return `:${p1}`;
    });

    // Parse Body
    let rawBody = "";
    if (entry.requestBody && entry.requestBody.content && entry.requestBody.content["application/json"]) {
        const schema = entry.requestBody.content["application/json"].schema;
        if (schema && schema.properties) {
            const bodyObj = {};
            for (const [prop, details] of Object.entries(schema.properties)) {
                if (details.type === "string") bodyObj[prop] = "string";
                else if (details.type === "number" || details.type === "integer") bodyObj[prop] = 0;
                else if (details.type === "boolean") bodyObj[prop] = false;
                else if (details.type === "array") bodyObj[prop] = [];
                else bodyObj[prop] = {};
            }
            rawBody = JSON.stringify(bodyObj, null, 2);
        }
    }

    const requestItem = {
      name: entry.summary || `${method.toUpperCase()} ${path}`,
      request: {
        method: method.toUpperCase(),
        header: [
            { key: "Content-Type", value: "application/json" }
        ],
        url: {
          raw: `{{baseUrl}}${formattedPath}`,
          host: ["{{baseUrl}}"],
          path: formattedPath.split("/").filter(Boolean),
          variable: urlVars
        }
      },
      response: []
    };

    if (rawBody) {
        requestItem.request.body = {
            mode: "raw",
            raw: rawBody,
            options: { raw: { language: "json" } }
        };
    }

    if (entry.security) {
        requestItem.request.auth = {
            type: "bearer",
            bearer: [
                {
                    key: "token",
                    value: "{{bearerToken}}",
                    type: "string"
                }
            ]
        };
    }

    groups[tag].push(requestItem);
  }
}

// Assemble collection
for (const [folderName, items] of Object.entries(groups)) {
  postmanCollection.item.push({
    name: folderName,
    item: items
  });
}

// Variables
postmanCollection.variable = [
  {
    key: "baseUrl",
    value: "http://localhost:3000/api"
  },
  {
    key: "bearerToken",
    value: ""
  }
];

fs.writeFileSync("quick_blush_postman_collection.json", JSON.stringify(postmanCollection, null, 2));
fs.writeFileSync("quick_blush_apis.json", JSON.stringify(swaggerDocs.paths, null, 2));
console.log("Collection Generated");
