import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, type Flight } from '../api';
import { TopNav } from '../components/TopNav';
import { useUser } from '../context/UserContext';

export function FlightDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { userId } = useUser();
  const [f, setF] = useState<Flight | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [idType, setIdType] = useState('身份证');
  const [idNo, setIdNo] = useState('');
  const [phone, setPhone] = useState('');
  const [couponId, setCouponId] = useState<string>('');
  const [coupons, setCoupons] = useState<{ id: string; title: string; used: boolean; minAmount: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const flight = await api.flight(id);
        if (!cancelled) setF(flight);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : '加载失败');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const c = await api.myCoupons(userId);
        if (!cancelled) setCoupons(c.list.filter((x) => !x.used));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function submit() {
    if (!userId) {
      alert('请先在「我的」中使用手机号登录');
      nav('/me');
      return;
    }
    if (!f || !name.trim() || !idNo.trim() || !phone.trim()) {
      setErr('请完整填写乘机人与联系人手机');
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const order = await api.createOrder(userId, {
        flightIds: [f.id],
        passengers: [{ name: name.trim(), idType, idNo: idNo.trim() }],
        contactPhone: phone.trim(),
        couponId: couponId || undefined,
      });
      nav(`/orders/${order.id}/pay`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : '下单失败');
    } finally {
      setSubmitting(false);
    }
  }

  if (!f && !err) return <div className="flyvio-page flyvio-loading">加载详情…</div>;

  return (
    <div className="flyvio-page">
      <TopNav title="航班与乘机人" />

      {err && <div className="flyvio-error">{err}</div>}

      {f && (
        <>
          <div className="flyvio-card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 8 }}>
              {f.dep_city} → {f.arr_city}
            </div>
            <div className="flyvio-muted" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
              <div>
                {f.dep_time.replace('T', ' ').slice(0, 16)} 起飞 · {f.arr_time.replace('T', ' ').slice(0, 16)} 到达
              </div>
              <div>
                {f.airline} {f.flight_no} · {f.cabin}
              </div>
              <div>
                航站楼：{f.dep_terminal || '—'} → {f.arr_terminal || '—'}
              </div>
            </div>
          </div>

          <div className="flyvio-card" style={{ padding: 16, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>价格套餐</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>基础票价（单人）</span>
              <strong style={{ color: 'var(--flyvio-blue)' }}>¥{f.price}</strong>
            </div>
            <div className="flyvio-muted" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
              <div>行李：{f.baggage_info}</div>
              <div>餐食：{f.meal_info}</div>
              {f.transfer_info && <div>中转：{f.transfer_info}</div>}
              <div>退改签：{f.refund_policy}</div>
            </div>
          </div>

          <div className="flyvio-card" style={{ padding: 16, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>乘机人</h3>
            <input className="flyvio-input" placeholder="姓名" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 10 }} />
            <select className="flyvio-input" value={idType} onChange={(e) => setIdType(e.target.value)} style={{ marginBottom: 10 }}>
              <option>身份证</option>
              <option>护照</option>
            </select>
            <input className="flyvio-input" placeholder="证件号码" value={idNo} onChange={(e) => setIdNo(e.target.value)} />
          </div>

          <div className="flyvio-card" style={{ padding: 16, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>联系人</h3>
            <input className="flyvio-input" placeholder="接收短信的手机号" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {coupons.length > 0 && (
            <div className="flyvio-card" style={{ padding: 16, marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '1rem' }}>优惠抵扣</h3>
              <select className="flyvio-input" value={couponId} onChange={(e) => setCouponId(e.target.value)}>
                <option value="">不使用优惠券</option>
                {coupons.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}（满{c.minAmount}可用）
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flyvio-card" style={{ padding: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="flyvio-muted" style={{ fontSize: '0.8rem' }}>
                合计（含演示税费逻辑简化）
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--flyvio-blue)' }}>¥{f.price}</div>
            </div>
            <Link to="/flights" className="flyvio-muted" style={{ fontSize: '0.85rem' }}>
              返回列表
            </Link>
          </div>

          <button type="button" className="flyvio-btn-primary" disabled={submitting} onClick={() => void submit()}>
            {submitting ? '提交中…' : '提交订单'}
          </button>
        </>
      )}
    </div>
  );
}
