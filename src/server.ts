// Trigger reload
import "reflect-metadata";
import http from "http";
import app from "./app";
import { AppDataSource } from "./config/data-source";
import { Server as SocketIOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { redisCache, redisSubClient } from "./config/redis";
import * as dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function bootstrap() {
    try {
        // Initialize Database Connection
        await AppDataSource.initialize();
        console.log("🚀 Custom Database connection initialized");

        // Automatically patch the PostgreSQL Enum to accept the new PAY_AFTER_SERVICE value
        try {
            await AppDataSource.query(`ALTER TYPE bookings_paymentstatus_enum ADD VALUE IF NOT EXISTS 'PAY_AFTER_SERVICE';`);
            console.log("✅ Verified PaymentStatus Enum in Database");
        } catch(e) {
            // Fallback for older PostgreSQL versions that don't support IF NOT EXISTS on ALTER TYPE
            try {
                await AppDataSource.query(`ALTER TYPE bookings_paymentstatus_enum ADD VALUE 'PAY_AFTER_SERVICE';`);
                console.log("✅ Added PAY_AFTER_SERVICE to Database Enum");
            } catch (err) {
                // Ignore if it already exists
            }
        }

        // Automatically patch the PostgreSQL Schema to add Urban Company address fields gracefully
        try {
            await AppDataSource.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "addressDetails" JSONB;`);
            await AppDataSource.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "contactNumber" VARCHAR(20);`);
            console.log("✅ Verified Structured Address schema in Database");
        } catch(e) {
            console.error("⚠️ Could not patch Structured Address columns:", e);
        }

        // Automatically patch the PostgreSQL Schema to add Elite Membership fields gracefully
        try {
            await AppDataSource.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "isElite" BOOLEAN DEFAULT false;`);
            await AppDataSource.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "eliteExpiryDate" TIMESTAMP;`);
            await AppDataSource.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "qbCoins" INT DEFAULT 0;`);
            
            // [HOTFIX] Explicitly inject fcmToken to prevent 500 crashes on Vendor queries
            await AppDataSource.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS "fcmToken" VARCHAR(500);`);
            console.log("✅ Verified Elite & FCM schema in Database");
        } catch(e) {
            console.error("⚠️ Could not patch Elite/FCM columns:", e);
        }

        // Create HTTP Server
        const server = http.createServer(app);

        // Initialize Socket.io
        const io = new SocketIOServer(server, {
            path: "/api/socket.io",
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        // Attach Redis adapter to power Pub/Sub messaging across scaled instances
        io.adapter(createAdapter(redisCache, redisSubClient));

        // Make Socket.io accessible in Express controllers
        app.set("io", io);

        io.on("connection", (socket) => {
            console.log(`Socket connected: ${socket.id}`);

            // Vendor emitting their live location
            socket.on("vendor:location_update", async (data) => {
                // data = { vendorId, lat, lng }
                try {
                    if (data.vendorId && data.lat && data.lng) {
                        // Store in Redis (ultra-fast in-memory cache), automatically expiring after 2 hours
                        await redisCache.set(
                            `vendor_loc:${data.vendorId}`,
                            JSON.stringify({ lat: data.lat, lng: data.lng, timestamp: Date.now() }),
                            "EX",
                            7200
                        );
                        
                        // We safely DELETED the Postgres AppDataSource.getRepository(Vendor).update(...) here
                        // to prevent database crashes and disk lockouts under high tracking load.
                    }
                } catch (err) {
                    console.error("Error caching vendor location in Redis:", err);
                }

                // Broadcast instantly to users tracking this vendor
                socket.broadcast.emit(`user:track_vendor_${data.vendorId}`, data);
            });

            // Booking status updates
            socket.on("job:status_update", (data) => {
                // data = { bookingId, status, vendorId }
                // Notify the specific user
                io.emit(`booking:update_${data.bookingId}`, data);
            });

            // Admin or system broadcasts a new job to nearby vendors
            socket.on("job:new_request", (data) => {
                // data = { bookingId, serviceDetails, lat, lng }
                // Notify vendors
                io.emit("vendor:new_job_alert", data);
            });

            socket.on("disconnect", () => {
                console.log(`Socket disconnected: ${socket.id}`);
            });
        });

        // Start listening
        server.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📄 Swagger Docs available at http://localhost:${PORT}/docs`);
        });

    } catch (error) {
        console.error("❌ Error during initialization", error);
        process.exit(1);
    }
}

bootstrap();
