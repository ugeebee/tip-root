package com.example.root_pay_native

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class DatabaseHelper(context: Context) : SQLiteOpenHelper(context, "root_pay.db", null, 1) {

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount TEXT,
                raw_text TEXT,
                source TEXT,
                timestamp LONG
            )
            """.trimIndent()
        )
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS transactions")
        onCreate(db)
    }

    fun insertTransaction(amount: String, rawText: String, source: String, timestamp: Long) {
        val db = this.writableDatabase
        val values = ContentValues().apply {
            put("amount", amount)
            put("raw_text", rawText)
            put("source", source)
            put("timestamp", timestamp)
        }
        db.insert("transactions", null, values)
        db.close()
    }

    fun getAllTransactions(): String {
        val db = this.readableDatabase
        val cursor = db.rawQuery("SELECT * FROM transactions ORDER BY id DESC", null)
        val sb = StringBuilder()

        if (cursor.moveToFirst()) {
            do {
                val id = cursor.getInt(0)
                val amount = cursor.getString(1)
                val rawText = cursor.getString(2)
                sb.append("[$id] ₹$amount -> $rawText\n\n")
            } while (cursor.moveToNext())
        } else {
            sb.append("No transactions logged yet.")
        }
        cursor.close()
        db.close()
        return sb.toString()
    }
}