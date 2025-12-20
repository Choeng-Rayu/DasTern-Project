import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz_data;
import '../models/prescription.dart';

/// Helper class for managing local notifications
class NotificationHelper {
  static final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  static bool _initialized = false;

  /// Initialize the notification system
  static Future<void> initialize() async {
    if (_initialized) return;

    // Initialize timezone
    tz_data.initializeTimeZones();

    // Android settings
    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    // iOS settings
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTap,
    );

    _initialized = true;
  }

  /// Handle notification tap
  static void _onNotificationTap(NotificationResponse response) {
    // Handle notification tap - navigate to medicine details
    // In production, this would navigate to the medicine details screen
    // For now, we just log it via debugPrint (safe for production)
    debugPrint('Notification tapped: ${response.payload}');
  }

  /// Request notification permissions
  static Future<bool> requestPermissions() async {
    final android = _notifications.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    if (android != null) {
      final granted = await android.requestNotificationsPermission();
      return granted ?? false;
    }
    return true;
  }

  /// Schedule a medicine reminder
  static Future<void> scheduleReminder({
    required int id,
    required String medicineName,
    required String dosage,
    required String time,
    required String instructions,
  }) async {
    await initialize();

    // Parse time string (e.g., "08:00")
    final timeParts = time.split(':');
    final hour = int.tryParse(timeParts[0]) ?? 8;
    final minute = int.tryParse(timeParts.length > 1 ? timeParts[1] : '0') ?? 0;

    // Calculate next occurrence
    final now = DateTime.now();
    var scheduledDate = DateTime(now.year, now.month, now.day, hour, minute);
    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }

    final tzDateTime = tz.TZDateTime.from(scheduledDate, tz.local);

    // Notification details
    const androidDetails = AndroidNotificationDetails(
      'medicine_reminders',
      'Medicine Reminders',
      channelDescription: 'Reminders to take your medicine',
      importance: Importance.high,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notifications.zonedSchedule(
      id,
      'ពេលវេលាញ៉ាំថ្នាំ - Time to take medicine',
      '$medicineName - $dosage\n$instructions',
      tzDateTime,
      details,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      matchDateTimeComponents: DateTimeComponents.time,
      payload: 'medicine_$id',
    );
  }

  /// Schedule all reminders from a list
  static Future<void> scheduleAllReminders(List<Reminder> reminders) async {
    // Cancel existing reminders first
    await cancelAllReminders();

    for (int i = 0; i < reminders.length; i++) {
      final reminder = reminders[i];
      await scheduleReminder(
        id: i,
        medicineName: reminder.medicineName,
        dosage: reminder.dosage,
        time: reminder.scheduledTime,
        instructions: reminder.instructions,
      );
    }
  }

  /// Cancel all scheduled reminders
  static Future<void> cancelAllReminders() async {
    await _notifications.cancelAll();
  }

  /// Cancel a specific reminder
  static Future<void> cancelReminder(int id) async {
    await _notifications.cancel(id);
  }

  /// Show an immediate notification (for testing)
  static Future<void> showTestNotification() async {
    await initialize();

    const androidDetails = AndroidNotificationDetails(
      'test_channel',
      'Test Notifications',
      channelDescription: 'Test notifications',
      importance: Importance.high,
      priority: Priority.high,
    );

    const details = NotificationDetails(android: androidDetails);

    await _notifications.show(
      0,
      'Test Notification',
      'This is a test notification from DasTern',
      details,
    );
  }
}

