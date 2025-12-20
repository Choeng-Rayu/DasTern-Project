// DasTern Widget Tests
import 'package:flutter_test/flutter_test.dart';
import 'package:dastern_mobile/main.dart';

void main() {
  testWidgets('DasTern app smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const DasTernApp());

    // Verify that the app title is displayed
    expect(find.text('DasTern - ដាសធើន'), findsOneWidget);

    // Verify welcome text is displayed
    expect(find.text('Welcome to DasTern'), findsOneWidget);
  });
}
