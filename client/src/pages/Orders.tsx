import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type OrderSummary } from '../api';
import { TopNav } from '../components/TopNav';
import { useUser } from '../context/UserContext';

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待支付' },
  { key: 'paid', label: '待出行' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
] as const;

export function Orders() {
  const { userId } = useUser();
  const [tab, setTab] = useState<(typeof tabs)[number]['key']>('all');
  const [list, setList] = useState<OrderSummary[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const statusParam =
          tab === 'all' ? undefined : tab === 'completed' ? 'paid' : tab;
        const res = await api.orders(userId, statusParam);
        let rows = res.list;
        if (tab === 'completed') {
          const now = Date.now();
          rows = rows.filter((o) => {
            const t = o.flights[0]?.dep_time;
            return t && new Date(t).getTime() < now;
          });
        }
        if (tab === 'paid') {
          const now = Date.now();
          rows = rows.filter((o) => {
            const t = o.flights[0]?.dep_time;
            return !t || new Date(t).getTime() >= now;
          });
        }
        if (!cancelled) setList(rows);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : '加载失败');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, tab]);

  if (!userId) {
    return (
      <div className="flyvio-page">
        <TopNav title="订单" />
        <div className="flyvio-card" style={{ padding: 20 }}>
          <p>登录后查看订单</p>
          <Link to="/me" className="flyvio-btn-primary" style={{ marginTop: 12, textDecoration: 'none' }}>
            去登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flyvio-page">
      <TopNav title="订单" />

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, paddingBottom: 4 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={tab === t.key ? 'flyvio-chip' : 'flyvio-chip-blue'}
            style={{ border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {err && <div className="flyvio-error">{err}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.map((o) => {
          const f = o.flights[0];
          return (
            <div key={o.id} className="flyvio-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700 }}>
                  {f ? `${f.dep_city} → ${f.arr_city}` : '订单'}
                </span>
                <span className="flyvio-chip-blue">{o.status}</span>
              </div>
              <div className="flyvio-muted" style={{ fontSize: '0.85rem' }}>
                {f && f.dep_time.replace('T', ' ').slice(0, 16)} · ¥{o.total_amount}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {o.status === 'pending' && (
                  <Link to={`/orders/${o.id}/pay`} className="flyvio-btn-primary" style={{ flex: 1, textDecoration: 'none' }}>
                    去支付
                  </Link>
                )}
                <Link to={`/orders/${o.id}`} className="flyvio-btn-secondary" style={{ flex: 1, textDecoration: 'none' }}>
                  详情
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {list.length === 0 && !err && <div className="flyvio-loading">暂无订单</div>}
    </div>
  );
}
