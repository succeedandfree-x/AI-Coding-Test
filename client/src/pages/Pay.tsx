import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { TopNav } from '../components/TopNav';
import { useUser } from '../context/UserContext';

export function Pay() {
  const { id } = useParams();
  const nav = useNavigate();
  const { userId } = useUser();
  const [left, setLeft] = useState(900);
  const [err, setErr] = useState<string | null>(null);
  const [order, setOrder] = useState<Awaited<ReturnType<typeof api.order>> | null>(null);

  useEffect(() => {
    if (!userId || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const o = await api.order(userId, id);
        if (!cancelled) setOrder(o);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : '加载订单失败');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, id]);

  useEffect(() => {
    if (!order || order.status !== 'pending') return;
    const t = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [order]);

  const mmss = useMemo(() => {
    const m = Math.floor(left / 60);
    const s = left % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [left]);

  async function doPay(method: string) {
    if (!userId || !id) return;
    setErr(null);
    try {
      await api.pay(userId, id, method);
      nav(`/orders/${id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : '支付失败');
    }
  }

  if (!userId) {
    return (
      <div className="flyvio-page">
        <TopNav title="收银台" />
        <div className="flyvio-error">请先登录</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flyvio-page flyvio-loading">
        {err || '加载订单…'}
      </div>
    );
  }

  if (order.status !== 'pending') {
    return (
      <div className="flyvio-page">
        <TopNav title="收银台" />
        <div className="flyvio-card" style={{ padding: 20 }}>
          该订单无需支付或已处理。
        </div>
      </div>
    );
  }

  const first = order.flights[0];

  return (
    <div className="flyvio-page">
      <TopNav title="确认支付" />

      {err && <div className="flyvio-error">{err}</div>}

      <div className="flyvio-card" style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>订单摘要</div>
        {first && (
          <div className="flyvio-muted" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
            <div>
              {first.dep_city} → {first.arr_city} · {first.airline} {first.flight_no}
            </div>
            <div>
              {first.dep_time.replace('T', ' ').slice(0, 16)} 起飞
            </div>
          </div>
        )}
        <div style={{ marginTop: 12, fontSize: '1.4rem', fontWeight: 800, color: 'var(--flyvio-blue)' }}>
          ¥{order.total_amount}
        </div>
        {order.discount_amount > 0 && (
          <div className="flyvio-muted" style={{ fontSize: '0.85rem' }}>
            已优惠 ¥{order.discount_amount}
          </div>
        )}
      </div>

      <div className="flyvio-card" style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontWeight: 700 }}>支付剩余时间</span>
          <span style={{ fontWeight: 800, color: 'var(--flyvio-blue)' }}>{mmss}</span>
        </div>
        <div className="flyvio-muted" style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
          重要提示：部分特价舱位可能限制退改，请以航班详情页展示为准；行李额度以航司规则为准。
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        <button type="button" className="flyvio-btn-primary" style={{ background: '#07c160' }} onClick={() => void doPay('wechat')}>
          微信支付
        </button>
        <button type="button" className="flyvio-btn-primary" style={{ background: '#1677ff' }} onClick={() => void doPay('alipay')}>
          支付宝
        </button>
        <button type="button" className="flyvio-btn-secondary" style={{ width: '100%' }} onClick={() => void doPay('unionpay')}>
          云闪付
        </button>
      </div>
    </div>
  );
}
