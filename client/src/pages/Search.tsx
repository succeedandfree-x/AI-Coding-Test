import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TopNav } from '../components/TopNav';

export function Search() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [roundTrip, setRoundTrip] = useState(sp.get('rt') === '1');
  const [dep, setDep] = useState(sp.get('dep') || '北京');
  const [arr, setArr] = useState(sp.get('arr') || '上海');
  const [depDate, setDepDate] = useState('2026-04-15');
  const [retDate, setRetDate] = useState('2026-04-18');
  const [adults, setAdults] = useState(1);
  const [directOnly, setDirectOnly] = useState(false);
  const [sort, setSort] = useState<'price' | 'departure' | 'duration'>('price');
  const [timeSlot, setTimeSlot] = useState<string>('');

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set('depCity', dep);
    p.set('arrCity', arr);
    p.set('depDate', depDate);
    p.set('sort', sort);
    if (directOnly) p.set('directOnly', '1');
    if (timeSlot) p.set('timeSlot', timeSlot);
    if (roundTrip) p.set('retDate', retDate);
    p.set('adults', String(adults));
    return p.toString();
  }, [dep, arr, depDate, retDate, roundTrip, adults, directOnly, sort, timeSlot]);

  return (
    <div className="flyvio-page">
      <TopNav title="机票查询" />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          className={roundTrip ? 'flyvio-btn-secondary' : 'flyvio-btn-primary'}
          style={{ flex: 1, boxShadow: 'none' }}
          onClick={() => setRoundTrip(false)}
        >
          单程
        </button>
        <button
          type="button"
          className={roundTrip ? 'flyvio-btn-primary' : 'flyvio-btn-secondary'}
          style={{ flex: 1, boxShadow: 'none' }}
          onClick={() => setRoundTrip(true)}
        >
          往返
        </button>
      </div>

      <div className="flyvio-card" style={{ padding: 16, marginBottom: 16 }}>
        <label className="flyvio-muted" style={{ fontSize: '0.8rem' }}>
          出发城市
        </label>
        <input className="flyvio-input" value={dep} onChange={(e) => setDep(e.target.value)} style={{ marginBottom: 12 }} />
        <label className="flyvio-muted" style={{ fontSize: '0.8rem' }}>
          到达城市
        </label>
        <input className="flyvio-input" value={arr} onChange={(e) => setArr(e.target.value)} style={{ marginBottom: 12 }} />
        <label className="flyvio-muted" style={{ fontSize: '0.8rem' }}>
          出发日期
        </label>
        <input className="flyvio-input" type="date" value={depDate} onChange={(e) => setDepDate(e.target.value)} style={{ marginBottom: 12 }} />
        {roundTrip && (
          <>
            <label className="flyvio-muted" style={{ fontSize: '0.8rem' }}>
              返程日期
            </label>
            <input className="flyvio-input" type="date" value={retDate} onChange={(e) => setRetDate(e.target.value)} style={{ marginBottom: 12 }} />
          </>
        )}
        <label className="flyvio-muted" style={{ fontSize: '0.8rem' }}>
          成人数量
        </label>
        <input
          className="flyvio-input"
          type="number"
          min={1}
          max={9}
          value={adults}
          onChange={(e) => setAdults(Number(e.target.value))}
        />
      </div>

      <div className="flyvio-card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>快捷筛选</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <input type="checkbox" checked={directOnly} onChange={(e) => setDirectOnly(e.target.checked)} />
          只看直飞
        </label>
        <div className="flyvio-muted" style={{ fontSize: '0.8rem', marginBottom: 6 }}>
          排序
        </div>
        <select className="flyvio-input" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} style={{ marginBottom: 12 }}>
          <option value="price">价格最低</option>
          <option value="departure">起飞最早</option>
          <option value="duration">耗时最短</option>
        </select>
        <div className="flyvio-muted" style={{ fontSize: '0.8rem', marginBottom: 6 }}>
          时间段
        </div>
        <select className="flyvio-input" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
          <option value="">不限</option>
          <option value="morning">早晨 06–12</option>
          <option value="afternoon">下午 12–18</option>
          <option value="evening">晚间 18–24</option>
          <option value="night">凌晨/深夜</option>
        </select>
      </div>

      <button type="button" className="flyvio-btn-primary" onClick={() => nav(`/flights?${qs}`)}>
        立即搜索
      </button>
    </div>
  );
}
