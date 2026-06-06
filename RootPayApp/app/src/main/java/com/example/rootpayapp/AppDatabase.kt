package com.example.rootpayapp

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.PrimaryKey
import androidx.room.RoomDatabase
import androidx.room.Query

@Entity(tableName = "transactions")
data class Transaction(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val time: String,
    val clientKey: String,
    val status: String = "unsent",
)

@Dao
interface TransactionDao {
    @Insert
    suspend fun insert(transaction: Transaction)

    @Query("UPDATE transactions SET status = 'sent' WHERE id = :id")
    suspend fun markAsSent(id: Int)

    @Query("SELECT * FROM transactions WHERE status = 'unsent'")
    suspend fun getUnsent(): List<Transaction>
}

@Database(entities = [Transaction::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun transactionDao(): TransactionDao
}
