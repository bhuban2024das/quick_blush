import { AppDataSource } from "./config/data-source";

async function patchDatabase() {
    try {
        console.log("Connecting to PostgreSQL Database...");
        await AppDataSource.initialize();
        console.log("✅ Successfully connected to PostgreSQL.");

        // Force FCM Token into Vendors
        try {
            console.log("Attempting to inject fcmToken into vendors...");
            await AppDataSource.query(`ALTER TABLE vendors ADD COLUMN "fcmToken" VARCHAR(500);`);
            console.log("✅ fcmToken injected into vendors successfully!");
        } catch (e: any) {
            console.log("⚠️ Minor warning on vendors:", e.message);
        }

        // Force FCM Token into Users (Just in case)
        try {
            console.log("Attempting to inject fcmToken into users...");
            await AppDataSource.query(`ALTER TABLE users ADD COLUMN "fcmToken" VARCHAR(500);`);
            console.log("✅ fcmToken injected into users successfully!");
        } catch (e: any) {
            console.log("⚠️ Minor warning on users:", e.message);
        }

        // Force Elite Columns
        try {
            console.log("Attempting to inject Elite columns into users...");
            await AppDataSource.query(`ALTER TABLE users ADD COLUMN "isElite" BOOLEAN DEFAULT false;`);
            await AppDataSource.query(`ALTER TABLE users ADD COLUMN "eliteExpiryDate" TIMESTAMP;`);
            await AppDataSource.query(`ALTER TABLE users ADD COLUMN "qbCoins" INT DEFAULT 0;`);
            console.log("✅ Elite columns injected into users successfully!");
        } catch (e: any) {
             console.log("⚠️ Minor warning on elite columns:", e.message);
        }

        console.log("🎉 All highly critical patches executed. You can reboot PM2 now.");
        process.exit(0);
    } catch (criticalError) {
        console.error("❌ CRITICAL DATABASE FAILURE:", criticalError);
        process.exit(1);
    }
}

patchDatabase();
