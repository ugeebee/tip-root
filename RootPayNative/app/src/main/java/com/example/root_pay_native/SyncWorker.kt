package com.example.root_pay_native

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.google.gson.annotations.SerializedName
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

data class TransactionPayload(
    @SerializedName("amount") val amount: String,
    @SerializedName("rawText") val rawText: String,
    @SerializedName("source") val source: String,
    @SerializedName("timestamp") val timestamp: Long
)

interface ApiService {
    @POST("api/v1/transactions") // Replace with your endpoint layout
    suspend fun sendTransaction(@Body payload: TransactionPayload): retrofit2.Response<Unit>
}

class SyncWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val rawText = inputData.getString("raw_text") ?: return Result.failure()
        val amount = inputData.getString("amount") ?: "0.00"
        val source = inputData.getString("source") ?: "unknown"
        val timestamp = inputData.getLong("timestamp", 0L)

        val payload = TransactionPayload(amount, rawText, source, timestamp)

        return try {
            // Setup Retrofit pointed to your API/Tunnel endpoint
            val retrofit = Retrofit.Builder()
                .baseUrl("https://your-selfhosted-backend.com/")
                .addConverterFactory(GsonConverterFactory.create())
                .build()

            val service = retrofit.create(ApiService::class.java)
            val response = service.sendTransaction(payload)

            if (response.isSuccessful) {
                Log.i("SyncWorker", "Successfully piped transaction info upstream!")
                Result.success()
            } else {
                Log.e("SyncWorker", "Server rejected sync: ${response.code()}")
                Result.retry() // Retries automatically if network flakes
            }
        } catch (e: Exception) {
            Log.e("SyncWorker", "Network payload failure", e)
            Result.retry()
        }
    }
}