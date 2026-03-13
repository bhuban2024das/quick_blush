import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quick_blush_app/main.dart';

void main() {
  testWidgets('Core App Load Test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      const ProviderScope(
        child: QuickBlushApp(),
      ),
    );

    // Verify that the title text loads.
    expect(find.text('Welcome to Quick Blush'), findsOneWidget);
  });
}
