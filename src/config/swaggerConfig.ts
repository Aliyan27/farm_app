import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "A&A Proteins & Farms Admin API",
      version: "1.0.0",
      description: "Backend API for poultry farm management system",
      contact: {
        name: "Malik",
        email: "malik@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      // Add production URL later
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
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: "Auth", description: "Public authentication endpoints" },
      { name: "Users", description: "User management" },
      { name: "Expenses", description: "Expense tracking" },
      { name: "Egg Production", description: "Daily egg production" },
      { name: "Egg Sales", description: "Egg sales revenue" },
      { name: "Feed Purchases", description: "Feed purchase & payments" },
      { name: "Salaries", description: "Employee salaries" },
      {
        name: "Reports",
        description: "Aggregated reports (income statement, etc.)",
      },
    ],
  },
  apis: [
    "./src/modules/**/*.ts", // routes define paths
    "./src/middlewares/**/*.ts", // auth middleware
  ],
};

export const specs = swaggerJsdoc(options);
