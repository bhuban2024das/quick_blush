"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Trigger reload
require("reflect-metadata");
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const data_source_1 = require("./config/data-source");
const socket_io_1 = require("socket.io");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const PORT = process.env.PORT || 3000;
async function bootstrap() {
    try {
        // Initialize Database Connection
        await data_source_1.AppDataSource.initialize();
        console.log("🚀 Custom Database connection initialized");
        // Create HTTP Server
        const server = http_1.default.createServer(app_1.default);
        // Initialize Socket.io
        const io = new socket_io_1.Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        // Make Socket.io accessible in Express controllers
        app_1.default.set("io", io);
        io.on("connection", (socket) => {
            console.log(`Socket connected: ${socket.id}`);
            // Vendor emitting their live location
            socket.on("vendor:location_update", (data) => {
                // data = { vendorId, lat, lng }
                // In a real app, save to Redis for fast geospatial queries
                // Broadcast to users tracking this vendor
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
    }
    catch (error) {
        console.error("❌ Error during initialization", error);
        process.exit(1);
    }
}
bootstrap();
