import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'

// مسار حفظ قاعدة البيانات في مجلد بيانات المستخدم لضمان عدم ضياعها
const dbPath = path.join(app.getPath('userData'), 'store.db')
const db = new Database(dbPath)

// تفعيل القيود والمفاتيح الأجنبية
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

export function initDatabase() {
  // 1. جدول أسعار الصرف
  db.exec(`
    CREATE TABLE IF NOT EXISTS exchange_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usd_to_syp REAL NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 2. جدول التصنيفات
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `)

  // إضافة تصنيفات افتراضية إن لم تكن موجودة
  const count = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }
  if (count.count === 0) {
    const insert = db.prepare('INSERT INTO categories (name) VALUES (?)')
    insert.run('موبايلات')
    insert.run('إكسسوارات')
    insert.run('قطع صيانة')
    insert.run('أدوات كهربائية')
  }

  // 3. جدول المنتجات
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name TEXT NOT NULL,
      sku TEXT UNIQUE,
      cost_price REAL NOT NULL,
      cost_currency TEXT NOT NULL DEFAULT 'USD',
      sell_price REAL NOT NULL,
      sell_currency TEXT NOT NULL DEFAULT 'SYP',
      quantity INTEGER NOT NULL DEFAULT 0,
      min_quantity_alert INTEGER NOT NULL DEFAULT 2,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `)

  console.log('Database initialized at:', dbPath)
}

export default db