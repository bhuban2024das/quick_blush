import * as admin from 'firebase-admin';

// Initialize Firebase Admin (will fail if not provided, but we can safely ignore in dev if not using FCM natively)
try {
    admin.initializeApp();
} catch (e) {
    console.warn("Firebase Admin Initialization missing GOOGLE_APPLICATION_CREDENTIALS. Push notifications may not work in development unless mocked.");
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
