package com.example.rootpayapp

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST

interface ApiService {
    @Headers(
        "Content-Type: application/json",
    )
    @POST("api/webhooks/upi")
    suspend fun sendKey(@Body body: Map<String, String>): retrofit2.Response<Unit>
}

object NetworkClient {
    val api: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl("https://root.ugbhartariya.com/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}