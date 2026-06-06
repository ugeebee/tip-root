package com.example.rootpayapp

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import androidx.room.Room
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class GatewayNotificationListener : NotificationListenerService() {
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private lateinit var db: AppDatabase

    override fun onCreate() {
        super.onCreate()
        Log.d("RootPay", "GatewayNotificationListener: Service Created")
        db = Room.databaseBuilder(applicationContext, AppDatabase::class.java, "transactions.db").build()
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.d("RootPay", "GatewayNotificationListener: Started Listening (Connected)")
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        Log.d("RootPay", "GatewayNotificationListener: Stopped Listening (Disconnected)")
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d("RootPay", "GatewayNotificationListener: Service Destroyed")
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val pkg = sbn.packageName
        Log.d("RootPay", "Notification received from: $pkg")
        if ((pkg == "com.google.android.apps.nbu.paisa.user") || (pkg == "com.google.android.apps.walletnfcrel")) {
            val extras = sbn.notification.extras
            val title = extras.getString(Notification.EXTRA_TITLE) ?: ""
            val text = extras.getString(Notification.EXTRA_TEXT) ?: ""
            val rawText = "$title $text"

            val match = Regex("\\b[a-zA-Z0-9]{32}\\b").find(rawText)
            if (match != null) {
                val clientKey = match.value
                Log.d("RootPay", "Extracted Key: $clientKey")

                scope.launch {
                    val tx = Transaction(
                        time = System.currentTimeMillis().toString(),
                        clientKey = clientKey,
                    )
                    db.transactionDao().insert(tx)

                    try {
                        val response = NetworkClient.api.sendKey(mapOf("client_key" to clientKey))
                        if (response.isSuccessful) {
                            db.transactionDao().markAsSent(tx.id)
                        }
                    } catch (_: Exception) {
                        Log.e("RootPay", "Network fail, WorkManager will retry.")
                    }
                }
            }
        }
    }
}

