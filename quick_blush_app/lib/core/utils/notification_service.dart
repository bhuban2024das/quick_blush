import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';

class NotificationService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final Logger _logger = Logger();

  Future<void> initialize() async {
    // Request permissions for iOS
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      _logger.i('User granted permission for notifications');
    }

    // Get FCM Token
    String? token = await _firebaseMessaging.getToken();
    if (token != null) {
      _logger.i('FCM Token: $token');
      // TODO: Send token to your backend (Dio required)
    }

    // Handle messages while the app is in the foreground
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      _logger.i('Got a message whilst in the foreground!');
      _logger.i('Message data: ${message.data}');

      if (message.notification != null) {
        _logger.i('Message also contained a notification: ${message.notification}');
      }
    });
  }
}

final notificationServiceProvider = Provider((ref) => NotificationService());
