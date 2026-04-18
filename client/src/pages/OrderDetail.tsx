import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, type OrderDetail as OD } from '../api';
import { TopNav } from '../components/TopNav';
import { useUser } from '../context/UserContext';

export function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { userId } = useUser();
  const [o, setO] = useState<OD | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const d = await api.order(userId, id);
        if (!cancelled) setO(d);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : '加载失败');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, id]);

  async function cancel() {
    if (!userId || !id || !window.confirm('确定取消待支付订单？')) return;
    try {
      await api.cancelOrder(userId, id);
      nav('/orders', { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : '取消失败');
    }
  }

  if (!userId) {
    return (
      <div className="flyvio-page">
        <TopNav title="订单详情" />
        <div className="flyvio-error">请先登录</div>
      </div>
    );
  }

  if (!o) {
    return (
      <div className="flyvio-page flyvio-loading">
        {err || '加载中…'}
      </div>
    );
  }

  const f = o.flights[0];

  return (
    <div className="flyvio-page">
      <TopNav title="订单详情" />

      {err && <div className="flyvio-error">{err}</div>}

      <div className="flyvio-card" style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>状态：{o.status}</div>
        <div className="flyvio-muted" style={{ fontSize: '0.85rem' }}>
          下单时间 {o.created_at?.replace('T', ' ').slice(0, 19)}
        </div>
      </div>

      {f && (
        <div className="flyvio-card" style={{ padding: 16, marginBottom: 12 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '1rem' }}>航班信息</h3>
          <div className="flyvio-muted" style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
            <div>
              {f.dep_city} → {f.arr_city}
            </div>
            <div>
              {f.airline} {f.flight_no} · {f.cabin}
            </div>
            <div>
              {f.dep_time.replace('T', ' ').slice(0, 16)} — {f.arr_time.replace('T', ' ').slice(0, 16)}
            </div>
            <div>
              {f.dep_airport} → {f.arr_airport}
            </div>
          </div>
        </div>
      )}

      <div className="flyvio-card" style={{ padding: 16, marginBottom: 12 }}>
        <h3 style={{ margin: '0 0 10px', fontSize: '1rem' }}>乘机人</h3>
        {o.passengers.map((p) => (
          <div key={p.idNo} className="flyvio-muted" style={{ fontSize: '0.9rem', marginBottom: 6 }}>
            {p.name} · {p.idType} {p.idNo}
          </div>
        ))}
        <div style={{ marginTop: 8 }}>联系人手机：{o.contact_phone}</div>
      </div>

      <div className="flyvio-card" style={{ padding: 16, marginBottom: 12 }}>
        <h3 style={{ margin: '0 0 10px', fontSize: '1rem' }}>费用明细</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>实付</span>
          <strong style={{ color: 'var(--flyvio-blue)' }}>¥{o.total_amount}</strong>
        </div>
        {o.discount_amount > 0 && (
          <div className="flyvio-muted" style={{ fontSize: '0.85rem', marginTop: 6 }}>
            优惠 ¥{o.discount_amount}
          </div>
        )}
      </div>

      {f && (
        <div className="flyvio-card" style={{ padding: 16, marginBottom: 12 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '1rem' }}>电子客票 / 退改</h3>
          <div className="flyvio-muted" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
            演示环境不生成真实票号。退改签政策：{f.refund_policy}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {o.status === 'pending' && (
          <>
            <Link to={`/orders/${o.id}/pay`} className="flyvio-btn-primary" style={{ textDecoration: 'none' }}>
              继续支付
            </Link>
            <button type="button" className="flyvio-btn-secondary" style={{ width: '100%' }} onClick={() => void cancel()}>
              取消订单
            </button>
          </>
        )}
        <Link to="/search" className="flyvio-btn-secondary" style={{ width: '100%', textDecoration: 'none' }}>
          再次购票
        </Link>
      </div>
    </div>
  );
}
