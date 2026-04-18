import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, type Flight } from '../api';
import { TopNav } from '../components/TopNav';

function fmtTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function fmtDur(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${m}m`;
}

export function FlightList() {
  const [sp] = useSearchParams();
  const [list, setList] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [aiHint, setAiHint] = useState<string | null>(null);

  const depCity = sp.get('depCity') || '';
  const arrCity = sp.get('arrCity') || '';
  const depDate = sp.get('depDate') || '';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const q: Record<string, string | undefined> = {
          depCity: depCity || undefined,
          arrCity: arrCity || undefined,
          depDate: depDate || undefined,
          directOnly: sp.get('directOnly') || undefined,
          sort: sp.get('sort') || 'price',
          timeSlot: sp.get('timeSlot') || undefined,
          airline: sp.get('airline') || undefined,
        };
        const res = await api.searchFlights(q);
        if (!cancelled) setList(res.list);
        if (depCity && arrCity && depDate) {
          const t = await api.aiPriceTrend({ depCity, arrCity, depDate });
          if (!cancelled) setAiHint(t.summary);
        } else if (!cancelled) setAiHint(null);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : '加载失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sp, depCity, arrCity, depDate]);

  return (
    <div className="flyvio-page">
      <TopNav title="航班列表" showSearch />

      {aiHint && (
        <div className="flyvio-card" style={{ padding: 14, marginBottom: 12, background: 'linear-gradient(90deg, #ecfeff, #edf5fc)', borderLeft: '3px solid var(--flyvio-cyan)' }}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--flyvio-blue)' }}>价格走势参考</div>
          <div className="flyvio-muted" style={{ fontSize: '0.9rem' }}>
            {aiHint}
          </div>
        </div>
      )}

      <div className="flyvio-card" style={{ padding: 12, marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <span className="flyvio-chip-blue">排序与筛选已在查询页选择</span>
        <Link to={`/search?dep=${encodeURIComponent(depCity)}&arr=${encodeURIComponent(arrCity)}`} className="flyvio-chip">
          修改条件
        </Link>
      </div>

      {loading && <div className="flyvio-loading">加载航班…</div>}
      {err && <div className="flyvio-error">{err}</div>}

      {!loading && !err && list.length === 0 && (
        <div className="flyvio-muted" style={{ textAlign: 'center', padding: 32 }}>
          暂无航班，试试更换日期或城市（演示数据含北京→上海、上海→广州/成都）。
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.map((f) => (
          <Link
            key={f.id}
            to={`/flights/${f.id}`}
            className="flyvio-card"
            style={{ padding: 16, textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {fmtTime(f.dep_time)} – {fmtTime(f.arr_time)}
                </div>
                <div className="flyvio-muted" style={{ fontSize: '0.85rem', marginTop: 4 }}>
                  {f.dep_airport} → {f.arr_airport} · {fmtDur(f.duration_min)}
                </div>
                <div style={{ marginTop: 8, fontWeight: 600 }}>
                  {f.airline} {f.flight_no}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--flyvio-blue)' }}>¥{f.price}</div>
                <div style={{ marginTop: 6 }}>
                  {f.is_direct ? <span className="flyvio-chip-blue">直飞</span> : <span className="flyvio-chip">中转</span>}
                  {f.tags?.includes('优惠') && (
                    <span className="flyvio-chip" style={{ marginLeft: 4 }}>
                      优惠
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flyvio-muted" style={{ fontSize: '0.78rem', marginTop: 10, lineHeight: 1.5 }}>
              行李：{f.baggage_info} · 退改：{f.refund_policy.slice(0, 36)}
              {f.refund_policy.length > 36 ? '…' : ''}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
