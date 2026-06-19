import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:notification_listener_service/notification_listener_service.dart';
import 'package:notification_listener_service/notification_event.dart';
import 'package:http/http.dart' as http;
import 'package:workmanager/workmanager.dart';
import 'database_helper.dart';

// IMPORTANT: WorkManager requires a top-level or static function.
@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    print(
      "🔄 WorkManager triggered: Attempting to sync unacknowledged keys...",
    );

    final dbHelper = DatabaseHelper.instance;
    final unackedKeys = await dbHelper.getUnackedKeys();

    if (unackedKeys.isEmpty) {
      print("👍 No unacknowledged keys found. Background task complete.");
      return Future.value(true);
    }

    const String goServerUrl =
        "https://tip-root.in/api/webhooks/upi?token=115663a5722f2836b96d120c23e59970"; //TODO- rotate token

    for (String key in unackedKeys) {
      try {
        final response = await http.post(
          Uri.parse(goServerUrl),
          headers: {"Content-Type": "application/json"},
          body: jsonEncode({"client_key": key}),
        );

        if (response.statusCode == 200) {
          await dbHelper.updateAck(key);
          print("🚀 Background Sync Success for key: $key");
        } else {
          print(
            "⚠️ Background Sync Rejected for key: $key (Status: ${response.statusCode})",
          );
        }
      } catch (e) {
        print("❌ Background Sync Failed for key: $key. Will retry later.");
        return Future.value(
          false,
        ); // Fails the task, WorkManager will backoff and retry
      }
    }
    return Future.value(true);
  });
}

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize WorkManager
  Workmanager().initialize(
    callbackDispatcher,
    isInDebugMode: true, // Set to false in production
  );

  runApp(const RootPayApp());
}

class RootPayApp extends StatelessWidget {
  const RootPayApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Root-Pay Trigger',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const DashboardScreen(),
    );
  }
}

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _hasPermission = false;
  final String _goServerUrl =
      "https://tip-root.in/api/webhooks/upi?token=115663a5722f2836b96d120c23e59970"; //TODO- rotate token

  final List<String> _targetPackages = [
    "com.google.android.apps.nbu.paisa.user",
    "com.phonepe.app",
    "net.one97.paytm",
  ];

  @override
  void initState() {
    super.initState();
    _checkPermission();
  }

  Future<void> _checkPermission() async {
    bool isGranted = await NotificationListenerService.isPermissionGranted();
    setState(() {
      _hasPermission = isGranted;
    });

    if (isGranted) {
      _startListening();
    }
  }

  Future<void> _requestPermission() async {
    await NotificationListenerService.requestPermission();
    _checkPermission();
  }

  void _startListening() {
    print("🎧 Root-Pay is now listening for UPI notifications...");
    final RegExp keyRegExp = RegExp(r'\b\d{32}\b');

    NotificationListenerService.notificationsStream.listen((
      ServiceNotificationEvent event,
    ) async {
      if (_targetPackages.contains(event.packageName) &&
          event.content != null) {
        var match = keyRegExp.firstMatch(event.content!);

        if (match != null) {
          String extractedKey = match.group(0)!;
          print("🚨 MATCH FOUND! Extracted Key: $extractedKey");

          // 1. Save to SQLite with ack = false
          await DatabaseHelper.instance.insertKey(extractedKey);

          // 2. Attempt to forward to server
          await _processKey(extractedKey);
        }
      }
    });
  }

  Future<void> _processKey(String clientKey) async {
    try {
      final response = await http.post(
        Uri.parse(_goServerUrl),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"client_key": clientKey}),
      );

      if (response.statusCode == 200) {
        print("🚀 Successfully unlocked SSE stream on Go Engine!");
        // 3. Server responded OK -> Update ack to true
        await DatabaseHelper.instance.updateAck(clientKey);
      } else {
        print("⚠️ Go Engine rejected the key. Status: ${response.statusCode}");
        _triggerWorkManagerSync();
      }
    } catch (e) {
      print("❌ Failed to reach Go server. Triggering background sync.");
      // Server unreachable -> trigger WorkManager to handle it in the background
      _triggerWorkManagerSync();
    }
  }

  void _triggerWorkManagerSync() {
    print("⚙️ Registering WorkManager to sync unacknowledged keys.");
    Workmanager().registerOneOffTask(
      "sync_unacked_keys",
      "syncKeysTask",
      constraints: Constraints(
        networkType: NetworkType
            .connected, // Only run when there is an active internet connection
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Root-Pay Engine',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _hasPermission ? Icons.check_circle : Icons.warning_amber_rounded,
              size: 80,
              color: _hasPermission ? Colors.green : Colors.orange,
            ),
            const SizedBox(height: 20),
            Text(
              _hasPermission
                  ? "Listening for UPI Payments..."
                  : "Notification Access Required",
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 40),
            if (!_hasPermission)
              ElevatedButton.icon(
                onPressed: _requestPermission,
                icon: const Icon(Icons.settings),
                label: const Text("Grant Permission"),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 16,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
