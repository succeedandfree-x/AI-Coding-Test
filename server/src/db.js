import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.NEXO_DB_PATH || join(__dirname, '..', 'data', 'nexo.db');

if (dbPath !== ':memory:') {
  mkdirSync(dirname(dbPath), { recursive: true });
}

export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE,
      nickname TEXT,
      avatar_url TEXT,
      preferences_json TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS flights (
      id TEXT PRIMARY KEY,
      airline TEXT NOT NULL,
      flight_no TEXT NOT NULL,
      dep_city TEXT NOT NULL,
      arr_city TEXT NOT NULL,
      dep_airport TEXT NOT NULL,
      arr_airport TEXT NOT NULL,
      dep_terminal TEXT,
      arr_terminal TEXT,
      dep_time TEXT NOT NULL,
      arr_time TEXT NOT NULL,
      duration_min INTEGER NOT NULL,
      price REAL NOT NULL,
      cabin TEXT DEFAULT '经济舱',
      baggage_info TEXT,
      refund_policy TEXT,
      meal_info TEXT,
      transfer_info TEXT,
      stock INTEGER NOT NULL DEFAULT 9,
      is_direct INTEGER NOT NULL DEFAULT 1,
      tags TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value REAL NOT NULL,
      min_amount REAL DEFAULT 0,
      valid_from TEXT,
      valid_to TEXT,
      stock INTEGER DEFAULT 999
    );

    CREATE TABLE IF NOT EXISTS user_coupons (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      coupon_id TEXT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
      used INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, coupon_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      flight_ids_json TEXT NOT NULL,
      passengers_json TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      total_amount REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      coupon_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      paid_at TEXT
    );

    CREATE TABLE IF NOT EXISTS price_monitors (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      dep_city TEXT NOT NULL,
      arr_city TEXT NOT NULL,
      dep_date_start TEXT NOT NULL,
      dep_date_end TEXT NOT NULL,
      target_price REAL NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      last_notified_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_flights_route ON flights(dep_city, arr_city);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_monitors_user ON price_monitors(user_id);
  `);
}

export function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM flights').get().c;
  if (count > 0) return;

  const insertFlight = db.prepare(`
    INSERT INTO flights (id, airline, flight_no, dep_city, arr_city, dep_airport, arr_airport,
      dep_terminal, arr_terminal, dep_time, arr_time, duration_min, price, cabin,
      baggage_info, refund_policy, meal_info, transfer_info, stock, is_direct, tags)
    VALUES (@id, @airline, @flight_no, @dep_city, @arr_city, @dep_airport, @arr_airport,
      @dep_terminal, @arr_terminal, @dep_time, @arr_time, @duration_min, @price, @cabin,
      @baggage_info, @refund_policy, @meal_info, @transfer_info, @stock, @is_direct, @tags)
  `);

  const flights = [
    {
      id: 'f1',
      airline: '中国国航',
      flight_no: 'CA1234',
      dep_city: '北京',
      arr_city: '上海',
      dep_airport: '首都T3',
      arr_airport: '虹桥T2',
      dep_terminal: 'T3',
      arr_terminal: 'T2',
      dep_time: '2026-04-15T08:30:00',
      arr_time: '2026-04-15T10:45:00',
      duration_min: 135,
      price: 580,
      cabin: '经济舱',
      baggage_info: '托运23kg×1，手提7kg×1',
      refund_policy: '起飞前24h外退改收手续费¥200；特价舱不退不改',
      meal_info: '含简餐',
      transfer_info: null,
      stock: 12,
      is_direct: 1,
      tags: '["直飞","含行李"]',
    },
    {
      id: 'f2',
      airline: '东方航空',
      flight_no: 'MU5100',
      dep_city: '北京',
      arr_city: '上海',
      dep_airport: '大兴',
      arr_airport: '浦东T1',
      dep_terminal: null,
      arr_terminal: 'T1',
      dep_time: '2026-04-15T14:00:00',
      arr_time: '2026-04-15T16:20:00',
      duration_min: 140,
      price: 520,
      cabin: '经济舱',
      baggage_info: '托运20kg×1',
      refund_policy: '按票面规则，详见购票须知',
      meal_info: '点心',
      transfer_info: null,
      stock: 5,
      is_direct: 1,
      tags: '["直飞","优惠"]',
    },
    {
      id: 'f3',
      airline: '南方航空',
      flight_no: 'CZ3999',
      dep_city: '北京',
      arr_city: '上海',
      dep_airport: '首都T2',
      arr_airport: '虹桥T2',
      dep_terminal: 'T2',
      arr_terminal: 'T2',
      dep_time: '2026-04-15T19:00:00',
      arr_time: '2026-04-15T23:30:00',
      duration_min: 270,
      price: 410,
      cabin: '经济舱',
      baggage_info: '托运23kg×1',
      refund_policy: '中转联程按段计费',
      meal_info: '第二段含餐',
      transfer_info: '广州中转 停留2h15m',
      stock: 8,
      is_direct: 0,
      tags: '["中转","低价"]',
    },
    {
      id: 'f4',
      airline: '海南航空',
      flight_no: 'HU7601',
      dep_city: '上海',
      arr_city: '广州',
      dep_airport: '虹桥T2',
      arr_airport: '白云T1',
      dep_terminal: 'T2',
      arr_terminal: 'T1',
      dep_time: '2026-04-16T09:00:00',
      arr_time: '2026-04-16T11:25:00',
      duration_min: 145,
      price: 490,
      cabin: '经济舱',
      baggage_info: '托运23kg×1',
      refund_policy: '起飞前可改签，退票收30%',
      meal_info: '热食',
      transfer_info: null,
      stock: 20,
      is_direct: 1,
      tags: '["直飞","托运行李"]',
    },
    {
      id: 'f5',
      airline: '厦门航空',
      flight_no: 'MF8302',
      dep_city: '上海',
      arr_city: '成都',
      dep_airport: '浦东T2',
      arr_airport: '天府T2',
      dep_terminal: 'T2',
      arr_terminal: 'T2',
      dep_time: '2026-04-17T07:30:00',
      arr_time: '2026-04-17T10:50:00',
      duration_min: 200,
      price: 668,
      cabin: '经济舱',
      baggage_info: '托运23kg×1',
      refund_policy: '标准退改',
      meal_info: '早餐',
      transfer_info: null,
      stock: 6,
      is_direct: 1,
      tags: '["直飞"]',
    },
  ];

  const tx = db.transaction(() => {
    for (const f of flights) insertFlight.run(f);
    db.prepare(
      `INSERT INTO coupons (id, code, title, discount_type, discount_value, min_amount, valid_from, valid_to, stock)
       VALUES ('c1', 'NEXO50', '新客立减', 'fixed', 50, 300, '2026-01-01', '2026-12-31', 999)`
    ).run();
    db.prepare(
      `INSERT INTO users (id, phone, nickname, preferences_json) VALUES ('u-demo', '13800000000', '演示用户', '{"cabinPref":"经济舱","budget":800}')`
    ).run();
    db.prepare(`INSERT INTO user_coupons (user_id, coupon_id, used) VALUES ('u-demo', 'c1', 0)`).run();
  });
  tx();
}
