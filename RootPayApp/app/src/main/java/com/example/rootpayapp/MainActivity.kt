package com.example.rootpayapp

import android.content.Intent
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.core.net.toUri
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.NotificationManagerCompat
import androidx.work.*
import java.util.concurrent.TimeUnit

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Queue the WorkManager backup task
        val syncWork = PeriodicWorkRequestBuilder<SyncWorker>(15, TimeUnit.MINUTES)
            .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
            .build()
        WorkManager.getInstance(this).enqueueUniquePeriodicWork("Sync", ExistingPeriodicWorkPolicy.KEEP, syncWork)

        setContent {
            GatewayScreen(
                onToggle = { isStarting ->
                    if (isStarting) {
                        requestPermissions()
                        val intent = Intent(this, GatewayForegroundService::class.java)
                        startForegroundService(intent)
                    } else {
                        stopService(Intent(this, GatewayForegroundService::class.java))
                    }
                }
            )
        }
    }

    private fun requestPermissions() {
        val pm = getSystemService(PowerManager::class.java)
        if (!pm.isIgnoringBatteryOptimizations(packageName)) {
            startActivity(Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, "package:$packageName".toUri()))
        }
        if (!NotificationManagerCompat.getEnabledListenerPackages(this).contains(packageName)) {
            startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
        }
    }
}

@Composable
fun GatewayScreen(onToggle: (Boolean) -> Unit) {
    var isStreaming by remember { mutableStateOf(false) }
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (isStreaming) 1.6f else 1f,
        animationSpec = infiniteRepeatable(tween(2000, easing = LinearOutSlowInEasing), RepeatMode.Restart),
        label = "scale"
    )
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.5f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(tween(2000, easing = LinearOutSlowInEasing), RepeatMode.Restart),
        label = "alpha"
    )

    Column(
        modifier = Modifier.fillMaxSize().background(Color(0xFFF8F9FB)),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(60.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("notBruce", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF6D28D9))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Clips", fontSize = 20.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF6B7280))
        }

        Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
            if (isStreaming) {
                Box(
                    modifier = Modifier.size(220.dp).graphicsLayer { scaleX = scale; scaleY = scale; this.alpha = alpha }
                        .background(Color(0xFF6D28D9), shape = CircleShape)
                )
            }

            Button(
                onClick = {
                    isStreaming = !isStreaming
                    onToggle(isStreaming)
                },
                modifier = Modifier.size(220.dp),
                shape = CircleShape,
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isStreaming) Color(0xFF6D28D9) else Color.White
                ),
                elevation = ButtonDefaults.buttonElevation(defaultElevation = 8.dp)
            ) {
                Text(
                    text = if (isStreaming) "Stop\nStreaming" else "Start\nStreaming",
                    textAlign = TextAlign.Center,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isStreaming) Color.White else Color(0xFF4B5563)
                )
            }
        }

        Text(
            text = if (isStreaming) "Listening for UPI notifications..." else "Service Offline",
            fontSize = 16.sp,
            fontWeight = FontWeight.Medium,
            color = if (isStreaming) Color(0xFF6D28D9) else Color(0xFF9CA3AF),
            modifier = Modifier.padding(bottom = 60.dp)
        )
    }
}