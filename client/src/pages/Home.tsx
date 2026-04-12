import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Flight, type HotRouteCard } from '../api';
import { HomeSmartModules } from '../components/HomeSmartModules';
import { HotRouteFlightCard } from '../components/HotRouteFlightCard';
import { TopNav } from '../components/TopNav';

export function Home() {
  const [specials, setSpecials] = useState<Flight[]>([]);
  const [hot, setHot] = useState<HotRouteCard[]>([]);
  const [inspire, setInspire] = useState<{ city: string; fromPrice: number; reason: string }[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [hotExpandKey, setHotExpandKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [a, b, c] = await Promise.all([
          api.todaySpecials(),
          api.hotRoutes(),
          api.aiDestInspiration({ budget: 700 }),
        ]);
        if (!cancelled) {
          setSpecials(a.list);
          setHot(b.list);
          setInspire(c.destinations.slice(0, 4));
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : '加载失败');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="nexo-page">
      <TopNav title="特价发现" showSearch />

      <section
        className="nexo-card"
        style={{ padding: 20, marginBottom: 20, background: 'linear-gradient(135deg, #ffffff 0%, #e8f4ff 100%)' }}
      >
        <p className="nexo-muted" style={{ margin: '0 0 8px' }}>
          全渠道真实比价 · 信息透明 · 合规出票保障
        </p>
        <h2 className="nexo-h1" style={{ fontSize: '1.35rem' }}>
          下一站，省心特价
        </h2>
        <Link
          to="/search"
          className="nexo-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 16,
            padding: '14px 16px',
            textDecoration: 'none',
            color: 'inherit',
            background: '#fff',
            border: '2px solid var(--nexo-blue)',
          }}
        >
          <span style={{ fontWeight: 700, color: 'var(--nexo-blue)' }}>出发 → 目的地</span>
          <span className="nexo-chip">快速查价</span>
        </Link>
      </section>

      <HomeSmartModules />

      <section style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>核心入口</h3>
        <div className="nexo-core-grid">
          {[
            { t: '特价机票', d: '低价优先全网样例', to: '/search', tone: 'blue' as const },
            { t: '往返特惠', d: '双程组合更省', to: '/search?rt=1', tone: 'yellow' as const },
            { t: '学生/青年', d: '认证后享补贴（演示）', to: '/me', tone: 'yellow' as const },
            { t: '优惠券', d: '我的券包', to: '/me', tone: 'blue' as const },
          ].map((x) => (
            <Link
              key={x.t}
              to={x.to}
              className={`nexo-core-tile nexo-core-tile--${x.tone}`}
            >
              <div className="nexo-core-tile__title">{x.t}</div>
              <div className="nexo-core-tile__desc">{x.d}</div>
            </Link>
          ))}
        </div>
      </section>

      {err && <div className="nexo-error">{err}</div>}

      <section style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>今日特价 · 手慢无</h3>
          <Link to="/flights" className="nexo-muted" style={{ fontSize: '0.85rem' }}>
            更多
          </Link>
        </div>
        <div className="nexo-home-specials">
          {specials.map((f) => (
            <Link
              key={f.id}
              to={`/flights/${f.id}`}
              className="nexo-card"
              style={{
                minWidth: 200,
                padding: 14,
                textDecoration: 'none',
                color: 'inherit',
                borderTop: '4px solid var(--nexo-yellow)',
              }}
            >
              <div style={{ fontWeight: 700 }}>
                {f.dep_city} → {f.arr_city}
              </div>
              <div style={{ marginTop: 8, fontSize: '1.35rem', fontWeight: 800, color: 'var(--nexo-blue)' }}>
                ¥{f.price}
                <span className="nexo-muted" style={{ fontSize: '0.75rem', fontWeight: 500, marginLeft: 6 }}>
                  起
                </span>
              </div>
              <div className="nexo-muted" style={{ fontSize: '0.78rem', marginTop: 6 }}>
                余票 {f.stock}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>热门航线</h3>
        <div className="nexo-home-hot-routes">
          {hot.map((r) => {
            const key = `${r.dep}-${r.arr}`;
            return (
              <HotRouteFlightCard
                key={key}
                route={r}
                expanded={hotExpandKey === key}
                onToggleExpand={() => setHotExpandKey((k) => (k === key ? null : key))}
              />
            );
          })}
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>AI 低价灵感</h3>
        <div className="nexo-card" style={{ padding: 16 }}>
          {inspire.map((d) => (
            <div key={d.city} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <strong>{d.city}</strong>
              <span style={{ marginLeft: 8, color: 'var(--nexo-blue)', fontWeight: 700 }}>¥{d.fromPrice}</span>
              <div className="nexo-muted" style={{ fontSize: '0.82rem', marginTop: 4 }}>
                {d.reason}
              </div>
            </div>
          ))}
          <Link to="/search" className="nexo-btn-secondary" style={{ width: '100%', marginTop: 4 }}>
            按预算重新搜票
          </Link>
        </div>
      </section>

      <section className="nexo-card" style={{ padding: 16, marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>服务保障</h3>
        <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--nexo-muted)', lineHeight: 1.7 }}>
          <li>官方直连渠道（演示数据）</li>
          <li>无默认捆绑销售</li>
          <li>行李/退改规则前置展示</li>
          <li>客服与订单可追溯</li>
        </ul>
      </section>
    </div>
  );
}
