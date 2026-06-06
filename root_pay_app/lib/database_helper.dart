import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('transactions.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(path, version: 1, onCreate: _createDB);
  }

  Future _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time TEXT NOT NULL,
        client_key TEXT NOT NULL,
        time_ack TEXT,
        status TEXT DEFAULT 'unsent'
      )
    ''');
  }

  Future<int> insertTransaction(String clientKey) async {
    final db = await instance.database;
    return await db.insert('transactions', {
      'time': DateTime.now().toIso8601String(),
      'client_key': clientKey,
      'status': 'unsent',
    });
  }

  Future<int> markAsSent(int id) async {
    final db = await instance.database;
    return await db.update(
      'transactions',
      {
        'status': 'sent',
        'time_ack': DateTime.now().toIso8601String(),
      },
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<List<Map<String, dynamic>>> getUnsentTransactions() async {
    final db = await instance.database;
    return await db.query(
      'transactions',
      where: 'status = ?',
      whereArgs: ['unsent'],
    );
  }
}