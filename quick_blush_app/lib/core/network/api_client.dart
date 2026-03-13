import 'package:dio/dio.dart';

class ApiClient {
  final Dio _dio;

  ApiClient(this._dio);

  Future<String> ping() async {
    final response = await _dio.get('/api/v1/ping');
    return response.data.toString();
  }
}
