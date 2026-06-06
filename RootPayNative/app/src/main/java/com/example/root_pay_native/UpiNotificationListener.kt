package com.example.root_pay_native

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import androidx.work.Data
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import java.util.regex.Pattern

class UpiNotificationListener : NotificationListenerService() {

    private val TAG = "UpiListener"

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null) return

        val packageName = sbn.packageName
        // Target payment apps (GPay, PhonePe, Paytm, BHIM)
        if (packageName.contains("com.google.android.apps.nbu.paisa.user") ||
            packageName.contains("com.phonepe.app") ||
            packageName.contains("net.one97.paytm")) {

            val extras = sbn.notification.extras
            val title = extras.getString("android.title") ?: ""
            val text = extras.getCharSequence("android.text")?.toString() ?: ""

            Log.d(TAG, "Intercepted from $packageName: $title -> $text")

            // Look for monetary amounts (e.g., Rs. 500 or ₹120.00)
            if (text.contains("received", ignoreCase = true) || text.contains("credited", ignoreCase = true)) {
                extractAndSync(text, packageName)
            }
        }
    }

    private fun extractAndSync(notificationText: String, sourceApp: String) {
        val amount = parseAmount(notificationText)

        // Bundle up the payload data for our Background Worker Queue
        val inputData = Data.Builder()
            .putString("raw_text", notificationText)
            .putString("amount", amount)
            .putString("source", sourceApp)
            .putLong("timestamp", System.currentTimeMillis())
            .build()

        val syncRequest = OneTimeWorkRequestBuilder<SyncWorker>()
            .setInputData(inputData)
            .build()

        WorkManager.getInstance(applicationContext).enqueue(syncRequest)
    }

    private fun parseAmount(text: String): String {
        val pattern = Pattern.compile("(?:Rs\\.?|₹)\\s*([0-9,]+(?:\\.[0-9]{2})?)")
        val matcher = pattern.matcher(text)
        return if (matcher.find()) matcher.group(1) ?: "0.00" else "0.00"
    }
}