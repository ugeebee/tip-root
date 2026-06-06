package com.example.rootpayapp

import android.content.Context
import androidx.room.Room
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters

class SyncWorker(appContext: Context, params: WorkerParameters) : CoroutineWorker(appContext, params) {
    override suspend fun doWork(): Result {
        val db = Room.databaseBuilder(applicationContext, AppDatabase::class.java, "transactions.db").build()
        val unsent = db.transactionDao().getUnsent()

        for (tx in unsent) {
            try {
                val response = NetworkClient.api.sendKey(mapOf("client_key" to tx.clientKey))
                if (response.isSuccessful) db.transactionDao().markAsSent(tx.id)
            } catch (_: Exception) {
                return Result.retry()
            }
        }
        return Result.success()
    }
}