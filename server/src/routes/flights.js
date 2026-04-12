import { Router } from 'express';
import { db } from '../db.js';

export const flightsRouter = Router();

function parseTags(row) {
  let tags = [];
  try {
    tags = row.tags ? JSON.parse(row.tags) : [];
  } catch {
    tags = [];
  }
  return { ...row, tags, is_direct: Boolean(row.is_direct) };
}

/** GET /api/flights 多条件查询 */
flightsRouter.get('/', (req, res) => {
  const {
    depCity,
    arrCity,
    depDate,
    directOnly,
    sort = 'price',
    airline,
    cabin,
    timeSlot,
  } = req.query;

  let sql = 'SELECT * FROM flights WHERE 1=1';
  const params = [];

  if (depCity) {
    sql += ' AND dep_city = ?';
    params.push(depCity);
  }
  if (arrCity) {
    sql += ' AND arr_city = ?';
    params.push(arrCity);
  }
  if (depDate) {
    sql += " AND date(dep_time) = date(?)";
    params.push(depDate);
  }
  if (directOnly === '1' || directOnly === 'true') {
    sql += ' AND is_direct = 1';
  }
  if (airline) {
    sql += ' AND airline LIKE ?';
    params.push(`%${airline}%`);
  }
  if (cabin) {
    sql += ' AND cabin = ?';
    params.push(cabin);
  }

  if (timeSlot === 'morning') {
    sql += " AND CAST(strftime('%H', dep_time) AS INTEGER) >= 6 AND CAST(strftime('%H', dep_time) AS INTEGER) < 12";
  } else if (timeSlot === 'afternoon') {
    sql += " AND CAST(strftime('%H', dep_time) AS INTEGER) >= 12 AND CAST(strftime('%H', dep_time) AS INTEGER) < 18";
  } else if (timeSlot === 'evening') {
    sql += " AND CAST(strftime('%H', dep_time) AS INTEGER) >= 18 AND CAST(strftime('%H', dep_time) AS INTEGER) < 24";
  } else if (timeSlot === 'night') {
    sql += " AND (CAST(strftime('%H', dep_time) AS INTEGER) < 6 OR CAST(strftime('%H', dep_time) AS INTEGER) >= 22)";
  }

  if (sort === 'departure') {
    sql += ' ORDER BY dep_time ASC';
  } else if (sort === 'duration') {
    sql += ' ORDER BY duration_min ASC, price ASC';
  } else {
    sql += ' ORDER BY price ASC, dep_time ASC';
  }

  const rows = db.prepare(sql).all(...params);
  res.json({ list: rows.map(parseTags) });
});

/** GET /api/flights/today-specials 今日特价（演示：取低价前几班） */
flightsRouter.get('/today-specials', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT * FROM flights WHERE stock > 0 ORDER BY price ASC LIMIT 8`
    )
    .all();
  res.json({ list: rows.map(parseTags) });
});

/** GET /api/flights/hot-routes 热门航线（演示：航班结果卡结构，无封面图） */
flightsRouter.get('/hot-routes', (_req, res) => {
  const routes = [
    {
      dep: '北京',
      arr: '上海',
      fromPrice: 410,
      airlineCode: 'MU',
      airlineColor: '#c8102e',
      airlineName: '中国东方航空',
      flightNo: 'MU5100',
      depTime: '14:00',
      arrTime: '16:20',
      depAirport: '北京大兴 PKX',
      arrAirport: '上海浦东 PVG',
      durationText: '2小时20分',
      stopSummary: '直飞',
      stopDetail: null,
      badgeText: '高性价比',
      totalPrice: 410,
      transparencyNote: '费用透明：展示价为含税合计，具体以支付页与航司确认为准。',
      channels: [
        { label: '东航 App', price: 410 },
        { label: '携程', price: 428 },
        { label: '同程', price: 419 },
      ],
      riskNote: '风险提示：特价舱退改规则较严，请行前确认。',
      baggage: '行李：含 20kg 托运',
      detailExtra: '餐食：点心 · 舱位：经济舱 · 余票紧张时价格可能实时变动。',
    },
    {
      dep: '上海',
      arr: '广州',
      fromPrice: 490,
      airlineCode: 'CZ',
      airlineColor: '#008fd5',
      airlineName: '南方航空',
      flightNo: 'CZ3582',
      depTime: '09:15',
      arrTime: '11:40',
      depAirport: '上海虹桥 SHA',
      arrAirport: '广州白云 CAN',
      durationText: '2小时25分',
      stopSummary: '直飞',
      stopDetail: null,
      badgeText: '高性价比',
      totalPrice: 490,
      transparencyNote: '费用透明：全渠道比价快照为演示数据，不代表实时库存。',
      channels: [
        { label: '南航 App', price: 490 },
        { label: '飞猪', price: 502 },
        { label: '美团', price: 498 },
      ],
      riskNote: null,
      baggage: '行李：含 23kg 托运',
      detailExtra: '直飞省时 · 支持电子登机牌（以机场为准）。',
    },
    {
      dep: '上海',
      arr: '成都',
      fromPrice: 668,
      airlineCode: 'MF',
      airlineColor: '#004589',
      airlineName: '厦门航空',
      flightNo: 'MF8302',
      depTime: '07:30',
      arrTime: '10:50',
      depAirport: '上海浦东 PVG',
      arrAirport: '成都天府 TFU',
      durationText: '3小时20分',
      stopSummary: '直飞',
      stopDetail: null,
      badgeText: '高性价比',
      totalPrice: 668,
      transparencyNote: '费用透明：经停/中转段地面服务以机场与航司为准。',
      channels: [
        { label: '厦航 App', price: 668 },
        { label: '携程', price: 685 },
        { label: '航旅纵横', price: 672 },
      ],
      riskNote: '风险提示：廉航/特价产品比价仅供参考。',
      baggage: '行李：含 23kg 托运',
      detailExtra: '早餐配餐 · 建议提前 2 小时抵达机场。',
    },
    {
      dep: '广州',
      arr: '北京',
      fromPrice: 720,
      airlineCode: 'CA',
      airlineColor: '#c41220',
      airlineName: '中国国际航空',
      flightNo: 'CA1310',
      depTime: '11:20',
      arrTime: '14:35',
      depAirport: '广州白云 CAN',
      arrAirport: '北京首都 PEK',
      durationText: '3小时15分',
      stopSummary: '1次经停',
      stopDetail: '中转/经停：武汉 WUH · 中转约 1h20m · 行李直挂以航司为准',
      badgeText: '高性价比',
      totalPrice: 720,
      transparencyNote: '费用透明：经停段地面服务以机场为准。',
      channels: [
        { label: '国航 App', price: 720 },
        { label: '携程', price: 738 },
        { label: '同程', price: 729 },
      ],
      riskNote: '风险提示：多段行程请留意各段退改规则。',
      baggage: '行李：含 23kg 托运',
      detailExtra: '热食配餐 · 经停航班请预留足够中转时间。',
    },
  ];
  res.json({ list: routes });
});

/** GET /api/flights/:id */
flightsRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM flights WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: '航班不存在' });
  res.json(parseTags(row));
});
