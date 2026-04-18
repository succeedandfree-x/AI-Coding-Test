import { test, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { initSchema, seedIfEmpty } from '../src/db.js';
import { app } from '../src/app.js';

before(() => {
  initSchema();
  seedIfEmpty();
});

test('GET / 返回前端或 API 说明页', async () => {
  const res = await request(app).get('/');
  assert.strictEqual(res.status, 200);
  const isSpa = res.text.includes('root') || res.text.includes('Flyvio');
  const isApiLanding = res.text.includes('FLYVIO');
  assert.ok(isSpa || isApiLanding);
});

test('GET /api/health', async () => {
  const res = await request(app).get('/api/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.ok, true);
});

test('GET /api/flights 按城市筛选', async () => {
  const res = await request(app).get('/api/flights').query({ depCity: '北京', arrCity: '上海' });
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body.list));
  assert.ok(res.body.list.length >= 1);
  assert.strictEqual(res.body.list[0].dep_city, '北京');
});

test('POST /api/orders 需登录', async () => {
  const res = await request(app).post('/api/orders').send({ flightIds: ['f1'], passengers: [{ name: '测' }], contactPhone: '13800000000' });
  assert.strictEqual(res.status, 401);
});

test('POST /api/users/login 返回用户', async () => {
  const res = await request(app).post('/api/users/login').send({ phone: '13900001111' });
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.id);
});

test('POST /api/orders 演示用户可下单', async () => {
  const res = await request(app)
    .post('/api/orders')
    .set('X-User-Id', 'u-demo')
    .send({
      flightIds: ['f1'],
      passengers: [{ name: '张三', idType: '身份证', idNo: '110101199001011234' }],
      contactPhone: '13800000000',
    });
  assert.strictEqual(res.status, 201);
  assert.ok(res.body.id);
});

test('POST /api/ai/price-trend', async () => {
  const res = await request(app).post('/api/ai/price-trend').send({
    depCity: '北京',
    arrCity: '上海',
    depDate: '2026-04-15',
  });
  assert.strictEqual(res.status, 200);
  assert.ok(['buy_now', 'wait'].includes(res.body.suggestion));
});
