import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, type PriceMonitor } from '../api';
import { TopNav } from '../components/TopNav';
import { useUser } from '../context/UserContext';

export function Monitors() {
  const { userId } = useUser();
  const [sp] = useSearchParams();
  const [list, setList] = useState<PriceMonitor[]>([]);
  const [dep, setDep] = useState(() => sp.get('dep') || '北京');
  const [arr, setArr] = useState(() => sp.get('arr') || '上海');
  const [start, setStart] = useState('2026-04-10');
  const [end, setEnd] = useState('2026-04-30');
  const [price, setPrice] = useState(() => {
    const p = sp.get('price');
    return p ? Number(p) : 500;
  });
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const d = sp.get('dep');
    const a = sp.get('arr');
    const pr = sp.get('price');
    if (d) setDep(d);
    if (a) setArr(a);
    if (pr) setPrice(Number(pr));
  }, [sp]);

  async function refresh() {
    if (!userId) return;
    const res = await api.monitors(userId);
    setList(res.list);
  }

  useEffect(() => {
    if (!userId) return;
    void refresh().catch(() => {});
  }, [userId]);

  async function add() {
    if (!userId) return;
    setErr(null);
    try {
      await api.createMonitor(userId, {
        depCity: dep,
        arrCity: arr,
        depDateStart: start,
        depDateEnd: end,
        targetPrice: price,
      });
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : '创建失败');
    }
  }

  async function remove(id: string) {
    if (!userId) return;
    await api.deleteMonitor(userId, id);
    await refresh();
  }

  if (!userId) {
    return (
      <div className="nexo-page">
        <TopNav title="低价监控" />
        <div className="nexo-card" style={{ padding: 20 }}>
          请先 <Link to="/me">登录</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="nexo-page">
      <TopNav title="低价监控" />

      <div className="nexo-card" style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>新建监控</h3>
        {err && <div className="nexo-error">{err}</div>}
        <input className="nexo-input" value={dep} onChange={(e) => setDep(e.target.value)} style={{ marginBottom: 8 }} placeholder="出发" />
        <input className="nexo-input" value={arr} onChange={(e) => setArr(e.target.value)} style={{ marginBottom: 8 }} placeholder="到达" />
        <input className="nexo-input" type="date" value={start} onChange={(e) => setStart(e.target.value)} style={{ marginBottom: 8 }} />
        <input className="nexo-input" type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={{ marginBottom: 8 }} />
        <input
          className="nexo-input"
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder="目标价"
        />
        <button type="button" className="nexo-btn-primary" style={{ marginTop: 12 }} onClick={() => void add()}>
          保存监控
        </button>
      </div>

      <h3 style={{ fontSize: '1rem', marginBottom: 10 }}>我的任务</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((m) => (
          <div key={m.id} className="nexo-card" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700 }}>
                {m.dep_city} → {m.arr_city}
              </div>
              <div className="nexo-muted" style={{ fontSize: '0.85rem' }}>
                {m.dep_date_start} ~ {m.dep_date_end} · 目标 ¥{m.target_price}
              </div>
            </div>
            <button type="button" className="nexo-btn-secondary" style={{ padding: '8px 12px' }} onClick={() => void remove(m.id)}>
              删除
            </button>
          </div>
        ))}
      </div>
      {list.length === 0 && <div className="nexo-muted" style={{ marginTop: 12 }}>暂无监控任务</div>}
    </div>
  );
}
