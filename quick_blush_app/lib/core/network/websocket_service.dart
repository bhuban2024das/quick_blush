import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:logger/logger.dart';

class WebSocketService {
  WebSocketChannel? _channel;
  final Logger _logger = Logger();

  void connect(String url) {
    try {
      _channel = WebSocketChannel.connect(Uri.parse(url));
      _logger.i('WebSocket connected to $url');
      _channel!.stream.listen((message) {
        _logger.i('WS receive: $message');
      }, onError: (error) {
        _logger.e('WS error: $error');
      }, onDone: () {
        _logger.w('WS connection closed');
      });
    } catch (e) {
      _logger.e('Failed to connect WebSocket: $e');
    }
  }

  void sendMessage(String message) {
    if (_channel != null) {
      _channel!.sink.add(message);
    } else {
      _logger.w('WebSocket channel is not connected');
    }
  }

  void dispose() {
    _channel?.sink.close();
  }
}

final webSocketProvider = Provider((ref) => WebSocketService());
