package com.example.root_pay_native

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.NotificationManagerCompat

class MainActivity : AppCompatActivity() {

    private lateinit var statusText: TextView
    private lateinit var actionButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Inflate the XML view layout safely
        setContentView(R.layout.activity_main)

        // Bind the UI element handles
        statusText = findViewById(R.id.statusText)
        actionButton = findViewById(R.id.actionButton)

        actionButton.setOnClickListener {
            startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
        }
    }

    override fun onResume() {
        super.onResume()

        // Safely check if our native listener has system interception permission
        val isAuthorized = NotificationManagerCompat.getEnabledListenerPackages(this)
            .contains(packageName)

        if (isAuthorized) {
            statusText.text = "System Interceptor: ACTIVE"
            actionButton.isEnabled = false
            actionButton.text = "Access Granted"
        } else {
            statusText.text = "System Interceptor: DISABLED"
            actionButton.isEnabled = true
            actionButton.text = "Grant Notification Access"
        }
    }
}