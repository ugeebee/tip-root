import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:workmanager/workmanager.dart';
import 'database_helper.dart';

const String webhookUrl = 'https://root.ugbhartariya.com/api/webhooks/upi';
const String authToken = 'Bearer super_secret_string_12345'; // Update to match your Go server

@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    final dbHelper = DatabaseHelper.instance;
    final unsentList = await dbHelper.getUnsentTransactions();

    if (unsentList.isEmpty) return Future.value(true);

    for (var tx in unsentList) {
      int id = tx['id'];
      String clientKey = tx['client_key'];

      try {
        final response = await http.post(
          Uri.parse(webhookUrl),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken,
          },
          body: jsonEncode({'client_key': clientKey}),
        );

        if (response.statusCode == 200) {
          await dbHelper.markAsSent(id);
          print("✅ WorkManager Sync Success: $clientKey");
        }
      } catch (e) {
        print("❌ WorkManager Sync Failed for $clientKey: $e");
      }
    }
    return Future.value(true);
  });
}