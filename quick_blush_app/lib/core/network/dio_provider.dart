import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quick_blush_app/core/network/api_client.dart';
import 'package:logger/logger.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: 'http://localhost:3000', // Default backend URL
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      contentType: 'application/json',
    ),
  );

  final logger = Logger();

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        logger.i('=> ${options.method} ${options.uri}');
        // TODO: Get token from FlutterSecureStorage and add Authorization header
        return handler.next(options);
      },
      onResponse: (response, handler) {
        logger.i('<= ${response.statusCode} ${response.requestOptions.uri}');
        return handler.next(response);
      },
      onError: (DioException e, handler) {
        logger.e('Error on ${e.requestOptions.uri}: ${e.message}');
        return handler.next(e);
      },
    ),
  );

  return dio;
});

final apiClientProvider = Provider<ApiClient>((ref) {
  final dio = ref.watch(dioProvider);
  return ApiClient(dio);
});
