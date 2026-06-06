import 'dart:async';
import 'dart:convert';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_background_service_android/flutter_background_service_android.dart';
import 'package:notification_listener_service/notification_event.dart';
import 'package:notification_listener_service/notification_listener_service.dart';
import 'package:permission_handler/permission_handler.dart'; // Modern, AGP 9+ Safe package
import 'package:workmanager/workmanager.dart';
import 'package:http/http.dart' as http;

import 'database_helper.dart';
import 'sync_worker.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize WorkManager for offline syncing
  Workmanager().initialize(callbackDispatcher, isInDebugMode: false);
  Workmanager().registerPeriodicTask(
    "1",
    "offlineSyncTask",
    frequency: const Duration(minutes: 15),
    constraints: Constraints(networkType: NetworkType.connected),
  );

  // Initialize the Foreground Service (but don't start it yet)
  await initializeService();

  runApp(const RootPayApp());
}

// ---------------------------------------------------------------------------
// FOREGROUND SERVICE ENGINE (Runs even if app is swiped away)
// ---------------------------------------------------------------------------
Future<void> initializeService() async {
  final service = FlutterBackgroundService();

  await service.configure(
    androidConfiguration: AndroidConfiguration(
      onStart: onStart,
      autoStart: false,
      isForegroundMode: true,
      notificationChannelId: 'rootpay_channel',
      initialNotificationTitle: 'Root-Pay Gateway',
      initialNotificationContent: 'Initializing background listening...',
      foregroundServiceNotificationId: 888,
    ),
    iosConfiguration: IosConfiguration(autoStart: false),
  );
}

@pragma('vm:entry-point')
void onStart(ServiceInstance service) async {
  DartPluginRegistrant.ensureInitialized();

  if (service is AndroidServiceInstance) {
    service.on('setAsForeground').listen((event) {
      service.setAsForegroundService();
    });

    service.on('setAsBackground').listen((event) {
      service.setAsBackgroundService();
    });
  }

  service.on('stopService').listen((event) {
    service.stopSelf();
  });

  if (service is AndroidServiceInstance) {
    service.setForegroundNotificationInfo(
      title: "Root-Pay Gateway",
      content: "Listening for UPI transactions...",
    );
  }

  // Start the notification stream in the background isolate
  NotificationListenerService.notificationsStream.listen((event) async {
    if (event.packageName == 'com.google.android.apps.nbu.paisa.user' || 
        event.packageName == 'com.google.android.apps.walletnfcrel') {
      
      String rawText = "${event.title} ${event.content}";
      RegExp regExp = RegExp(r'\b[a-zA-Z0-9]{32}\b');
      var match = regExp.firstMatch(rawText);

      if (match != null) {
        String clientKey = match.group(0)!;
        print("✅ Background Extracted Client Key: $clientKey");

        final dbHelper = DatabaseHelper.instance;
        int txId = await dbHelper.insertTransaction(clientKey);

        try {
          final response = await http.post(
            Uri.parse('https://root.ugbhartariya.com/api/webhooks/upi'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer super_secret_string_12345',
            },
            body: jsonEncode({'client_key': clientKey}),
          );

          if (response.statusCode == 200) {
            await dbHelper.markAsSent(txId);
            print("✅ Immediate push successful!");
          }
        } catch (e) {
          print("❌ Immediate push failed, WorkManager will handle it. Error: $e");
        }
      }
    }
  });
}

// ---------------------------------------------------------------------------
// MAIN UI
// ---------------------------------------------------------------------------
class RootPayApp extends StatelessWidget {
  const RootPayApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Root-Pay Gateway',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFFF8F9FB),
        fontFamily: 'Roboto',
      ),
      home: const GatewayScreen(),
    );
  }
}

class GatewayScreen extends StatefulWidget {
  const GatewayScreen({super.key});

  @override
  State<GatewayScreen> createState() => _GatewayScreenState();
}

class _GatewayScreenState extends State<GatewayScreen> with SingleTickerProviderStateMixin {
  bool _isStreaming = false;
  late AnimationController _pulseController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _checkServiceStatus();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.6).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeOut),
    );

    _fadeAnimation = Tween<double>(begin: 0.5, end: 0.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _checkServiceStatus() async {
    final service = FlutterBackgroundService();
    bool isRunning = await service.isRunning();
    setState(() {
      _isStreaming = isRunning;
      if (isRunning) _pulseController.repeat();
    });
  }

  void _toggleStreaming() async {
    final service = FlutterBackgroundService();

    if (!_isStreaming) {
      // 1. Ask for Battery Ignore Optimization using permission_handler
      var batteryStatus = await Permission.ignoreBatteryOptimizations.status;
      if (batteryStatus.isDenied) {
        await Permission.ignoreBatteryOptimizations.request();
      }

      // 2. Ask for Notification Access
      bool isGranted = await NotificationListenerService.isPermissionGranted();
      if (!isGranted) {
        await NotificationListenerService.requestPermission();
        isGranted = await NotificationListenerService.isPermissionGranted();
        if (!isGranted) return; // Abort if denied
      }
      
      // 3. Start the Foreground Service
      await service.startService();
      _pulseController.repeat();
      _showToast();
      
      setState(() => _isStreaming = true);
      
    } else {
      // Turn off
      service.invoke("stopService");
      _pulseController.reset();
      
      setState(() => _isStreaming = false);
    }
  }

  void _showToast() {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text(
          'App is now listening to UPI notifications.',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
          textAlign: TextAlign.center,
        ),
        backgroundColor: const Color(0xFF374151),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.only(top: 40.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Text(
                    'notBruce',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF6D28D9),
                      letterSpacing: -0.5,
                    ),
                  ),
                  SizedBox(width: 6),
                  Text(
                    'Clips',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF6B7280),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Center(
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    if (_isStreaming)
                      AnimatedBuilder(
                        animation: _pulseController,
                        builder: (context, child) {
                          return Transform.scale(
                            scale: _scaleAnimation.value,
                            child: Opacity(
                              opacity: _fadeAnimation.value,
                              child: Container(
                                width: 220,
                                height: 220,
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Color(0xFF6D28D9),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    GestureDetector(
                      onTap: _toggleStreaming,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        width: 220,
                        height: 220,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _isStreaming ? const Color(0xFF6D28D9) : Colors.white,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 15,
                              offset: const Offset(0, 8),
                            ),
                          ],
                          border: Border.all(
                            color: _isStreaming ? Colors.transparent : const Color(0xFFE5E7EB),
                            width: 2,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            _isStreaming ? 'Stop\nStreaming' : 'Start\nStreaming',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                              color: _isStreaming ? Colors.white : const Color(0xFF4B5563),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 60.0),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: Text(
                  _isStreaming 
                      ? 'Listening for UPI transactions in background...' 
                      : 'Service Offline',
                  key: ValueKey<bool>(_isStreaming),
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: _isStreaming ? const Color(0xFF6D28D9) : const Color(0xFF9CA3AF),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}