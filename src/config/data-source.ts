import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
   
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "quick_blush",
    synchronize: process.env.NODE_ENV !== "production", // auto sync schema in dev
    logging: process.env.NODE_ENV !== "production",
    entities: [process.env.NODE_ENV === "production" ? "dist/entities/**/*.js" : "src/entities/**/*.ts"],
    migrations: [process.env.NODE_ENV === "production" ? "dist/migrations/**/*.js" : "src/migrations/**/*.ts"],
    subscribers: [process.env.NODE_ENV === "production" ? "dist/subscribers/**/*.js" : "src/subscribers/**/*.ts"],
});
