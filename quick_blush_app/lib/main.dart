import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quick_blush_app/core/theme/app_theme.dart';
import 'package:quick_blush_app/core/routing/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // TODO: Initialize Isar
  // TODO: Initialize Firebase (FCM)
  // TODO: Initialize Shared Preferences / Secure Storage

  runApp(
    const ProviderScope(
      child: QuickBlushApp(),
    ),
  );
}

class QuickBlushApp extends ConsumerWidget {
  const QuickBlushApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Quick Blush',
      theme: AppTheme.darkTheme,
      debugShowCheckedModeBanner: false,
      routerConfig: router,
    );
  }
}
