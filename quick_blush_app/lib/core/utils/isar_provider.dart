import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:isar/isar.dart';
import 'package:path_provider/path_provider.dart';

final isarProvider = Provider<Isar>((ref) {
  throw UnimplementedError('Isar is initialized in main() and overridden in ProviderScope');
});

Future<Isar> initIsar() async {
  final dir = await getApplicationDocumentsDirectory();
  return await Isar.open(
    [], // Add generated schemas here later
    directory: dir.path,
  );
}
