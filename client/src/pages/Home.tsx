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
    <div className="flyvio-page">
      <TopNav title="特价发现" />

      {/* Hero: tagline + quick search — no card background */}
      <section style={{ padding: '12px 0 20px', marginBottom: 20 }}>
        <p style={{ margin: '0 0 6px', fontSize: '0.85rem', color: 'var(--flyvio-muted)' }}>
          全渠道真实比价 · 信息透明 · 合规出票保障
        </p>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
          下一站，省心特价
        </h2>
        <Link
          to="/search"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            textDecoration: 'none',
            color: 'inherit',
            background: '#fff',
            border: '1px solid rgba(13, 74, 122, 0.15)',
            borderRadius: 'var(--flyvio-radius-sm)',
            boxShadow: 'var(--flyvio-shadow)',
          }}
        >
          <span style={{ fontWeight: 700, color: 'var(--flyvio-blue)' }}>出发 → 目的地</span>
          <span className="flyvio-chip">快速查价</span>
        </Link>
      </section>

      {/* Core grid: 6 tiles including trend & monitor */}
      <section style={{ marginBottom: 20 }}>
        <h3 className="flyvio-section-title">核心入口</h3>
        <div className="flyvio-core-grid">
          {[
            { t: '特价机票', d: '低价优先全网样例', to: '/search', tone: 'blue' as const },
            { t: '往返特惠', d: '双程组合更省', to: '/search?rt=1', tone: 'yellow' as const },
            { t: '价格走势预测', d: '智能分析趋势', to: '#flyvio-trend-section', tone: 'green' as const },
            { t: '低价趋势监控', d: '7天×24小时到价提醒', to: '#flyvio-monitor-section', tone: 'green' as const },
            { t: '学生/青年', d: '认证后享补贴（演示）', to: '/me', tone: 'yellow' as const },
            { t: '优惠券', d: '我的券包', to: '/me', tone: 'blue' as const },
          ].map((x) => (
            <Link
              key={x.t}
              to={x.to}
              className={`flyvio-core-tile flyvio-core-tile--${x.tone}`}
            >
              <div className="flyvio-core-tile__title">{x.t}</div>
              <div className="flyvio-core-tile__desc">{x.d}</div>
            </Link>
          ))}
        </div>
      </section>

      {err && <div className="flyvio-error">{err}</div>}

      {/* Today specials */}
      <section style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 className="flyvio-section-title" style={{ marginBottom: 0 }}>今日特价</h3>
          <Link to="/flights" className="flyvio-muted" style={{ fontSize: '0.85rem' }}>
            更多
          </Link>
        </div>
        <div className="flyvio-home-specials">
          {specials.map((f) => (
            <Link
              key={f.id}
              to={`/flights/${f.id}`}
              className="flyvio-card"
              style={{
                minWidth: 200,
                padding: 12,
                textDecoration: 'none',
                color: 'inherit',
                borderLeft: '3px solid var(--flyvio-cyan)',
              }}
            >
              <div style={{ fontWeight: 700 }}>
                {f.dep_city} → {f.arr_city}
              </div>
              <div style={{ marginTop: 8, fontSize: '1.35rem', fontWeight: 800, color: 'var(--flyvio-cyan)' }}>
                ¥{f.price}
                <span className="flyvio-muted" style={{ fontSize: '0.75rem', fontWeight: 500, marginLeft: 6 }}>
                  起
                </span>
              </div>
              <div className="flyvio-muted" style={{ fontSize: '0.78rem', marginTop: 6 }}>
                余票 {f.stock}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Hot routes */}
      <section style={{ marginBottom: 20 }}>
        <h3 className="flyvio-section-title">热门航线</h3>
        <div className="flyvio-home-hot-routes">
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

      {/* Divider */}
      <div className="flyvio-section-sep" />

      {/* Smart modules: trend & monitor (placed below hot routes) */}
      <HomeSmartModules />

      {/* AI inspiration */}
      <section style={{ marginBottom: 24 }}>
        <h3 className="flyvio-section-title">低价灵感</h3>
        <div className="flyvio-card" style={{ padding: 14 }}>
          {inspire.map((d) => (
            <div key={d.city} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid rgba(13, 74, 122, 0.06)' }}>
              <strong>{d.city}</strong>
              <span style={{ marginLeft: 8, color: 'var(--flyvio-cyan)', fontWeight: 700 }}>¥{d.fromPrice}</span>
              <div className="flyvio-muted" style={{ fontSize: '0.82rem', marginTop: 4 }}>
                {d.reason}
              </div>
            </div>
          ))}
          <Link to="/search" className="flyvio-btn-secondary" style={{ width: '100%', marginTop: 4 }}>
            按预算重新搜票
          </Link>
        </div>
      </section>

      {/* Service guarantees */}
      <section className="flyvio-card" style={{ padding: 14, marginBottom: 32, borderLeft: '3px solid var(--flyvio-blue)' }}>
        <h3 className="flyvio-section-title">服务保障</h3>
        <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--flyvio-muted)', lineHeight: 1.7, fontSize: '0.88rem' }}>
          <li>官方直连渠道（演示数据）</li>
          <li>无默认捆绑销售</li>
          <li>行李/退改规则前置展示</li>
          <li>客服与订单可追溯</li>
        </ul>
      </section>
    </div>
  );
}
