import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { TopNav } from '../components/TopNav';
import { useUser } from '../context/UserContext';

export function Profile() {
  const { userId, nickname, phone, login, logout } = useUser();
  const [p, setP] = useState('');
  const [busy, setBusy] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);

  async function onLogin() {
    if (!p.trim()) return;
    setBusy(true);
    try {
      await login(p.trim());
      setP('');
    } catch (e) {
      alert(e instanceof Error ? e.message : '登录失败');
    } finally {
      setBusy(false);
    }
  }

  async function runAi() {
    if (!userId) return;
    setBusy(true);
    try {
      const r = await api.aiTripRecommend(userId, { budget: 750 });
      setAiText(r.trips.map((t) => `${t.summary} · ¥${t.price}`).join('\n'));
    } catch (e) {
      setAiText(e instanceof Error ? e.message : '推荐失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="nexo-page">
      <TopNav title="我的" right={<span className="nexo-muted" style={{ fontSize: '0.75rem' }}>客服</span>} />

      <div className="nexo-card" style={{ padding: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--nexo-yellow-soft), var(--nexo-blue-soft))',
            flexShrink: 0,
          }}
        />
        <div>
          {userId ? (
            <>
              <div style={{ fontWeight: 800 }}>{nickname || '用户'}</div>
              <div className="nexo-muted" style={{ fontSize: '0.88rem' }}>
                {phone}
              </div>
            </>
          ) : (
            <div className="nexo-muted">登录后同步订单与监控</div>
          )}
        </div>
      </div>

      {!userId && (
        <div className="nexo-card" style={{ padding: 16, marginBottom: 16 }}>
          <div className="nexo-muted" style={{ marginBottom: 8, fontSize: '0.85rem' }}>
            使用手机号快速登录（演示）
          </div>
          <input className="nexo-input" placeholder="手机号" value={p} onChange={(e) => setP(e.target.value)} />
          <button type="button" className="nexo-btn-primary" style={{ marginTop: 12 }} disabled={busy} onClick={() => void onLogin()}>
            {busy ? '…' : '登录 / 注册'}
          </button>
          <div className="nexo-muted" style={{ fontSize: '0.78rem', marginTop: 10 }}>
            试用演示账号手机号：<strong>13800000000</strong>（含新客券）
          </div>
        </div>
      )}

      {userId && (
        <div className="nexo-card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>AI 个性化行程（演示）</div>
          <button type="button" className="nexo-btn-secondary" style={{ width: '100%' }} disabled={busy} onClick={() => void runAi()}>
            按预算生成推荐
          </button>
          {aiText && (
            <pre
              style={{
                marginTop: 12,
                whiteSpace: 'pre-wrap',
                fontSize: '0.85rem',
                color: 'var(--nexo-muted)',
                fontFamily: 'inherit',
              }}
            >
              {aiText}
            </pre>
          )}
        </div>
      )}

      <div className="nexo-card" style={{ padding: 8, marginBottom: 16 }}>
        {[
          { t: '低价监控', to: '/me/monitors', sub: '7×24 目标价提醒' },
          { t: '常用乘客', to: '/me', sub: '演示入口' },
          { t: '我的收藏', to: '/', sub: '首页特价' },
          { t: '帮助与客服', to: '/me', sub: '即将上线' },
        ].map((x) => (
          <Link
            key={x.t}
            to={x.to}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '14px 12px',
              textDecoration: 'none',
              color: 'inherit',
              borderBottom: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{x.t}</div>
              <div className="nexo-muted" style={{ fontSize: '0.8rem' }}>
                {x.sub}
              </div>
            </div>
            <span className="nexo-muted">›</span>
          </Link>
        ))}
      </div>

      <div className="nexo-card" style={{ padding: 8, marginBottom: 24 }}>
        {[
          { t: '账号安全', d: '手机号、密码（演示）' },
          { t: '关于 Flyvio', d: '特价机票发现平台' },
        ].map((x) => (
          <div key={x.t} style={{ padding: '14px 12px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ fontWeight: 600 }}>{x.t}</div>
            <div className="nexo-muted" style={{ fontSize: '0.8rem' }}>{x.d}</div>
          </div>
        ))}
        {userId && (
          <button
            type="button"
            onClick={() => logout()}
            className="nexo-btn-secondary"
            style={{ width: 'calc(100% - 24px)', margin: 12, borderColor: '#a32020', color: '#a32020' }}
          >
            退出登录
          </button>
        )}
      </div>
    </div>
  );
}
