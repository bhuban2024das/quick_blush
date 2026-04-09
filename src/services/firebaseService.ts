import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

try {
    const keyPath = path.resolve(__dirname, "../../firebase-admin.json");
    if (fs.existsSync(keyPath)) {
        admin.initializeApp({
            credential: admin.credential.cert(require(keyPath))
        });
        console.log("[FCM] Firebase loaded securely using local JSON Admin Key!");
    } else {
        admin.initializeApp(); // Fallback
    }
} catch (e) {
    console.warn("Firebase Admin Initialization missing Credentials. FCM pushes will fail natively.");
}

export const firebaseService = {
    /**
     * Send a High Priority push notification to trigger CallKit natively.
     */
    async sendJobAlert(fcmToken: string, bookingId: string, customerName: string) {
        if (!fcmToken) return;

        const message = {
            token: fcmToken,
            data: {
                type: 'JOB_ALERT',
                jobId: bookingId,
                customerName: customerName
            },
            android: {
                priority: "high" as const
            },
            apns: {
                headers: {
                    "apns-priority": "10"
                },
                payload: {
                    aps: {
                        contentAvailable: true,
                        sound: 'default'
                    }
                }
            }
        };

        try {
            const response = await admin.messaging().send(message);
            console.log(`[FCM] Successfully sent high-priority message: ${response}`);
        } catch (error) {
            console.error('[FCM] Error sending message:', error);
        }
    }
};
