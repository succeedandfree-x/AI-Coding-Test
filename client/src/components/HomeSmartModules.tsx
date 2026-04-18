import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

/** SVG icons for smart modules */
function TrendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

/** 与演示库航班数据对齐的航程（便于价格样本命中） */
const TREND_ROUTE_PRESETS = [
  { id: 'pek-sha', depCity: '北京', arrCity: '上海', depDate: '2026-04-15', label: '北京 → 上海' },
  { id: 'sha-can', depCity: '上海', arrCity: '广州', depDate: '2026-04-16', label: '上海 → 广州' },
  { id: 'sha-ctu', depCity: '上海', arrCity: '成都', depDate: '2026-04-17', label: '上海 → 成都' },
] as const;

function buildTrendSeries(referenceMin: number, referenceAvg: number): number[] {
  const minP = Math.round(Math.min(referenceMin, referenceAvg));
  const avgP = Math.round(Math.max(referenceMin, referenceAvg));
  const peak = Math.round(avgP * 1.06 + 20);
  const mid = Math.round((avgP + minP) / 2);
  return [peak, Math.round(peak * 0.94), avgP, mid, Math.round(minP * 1.1), Math.round(minP * 1.04), minP];
}

function TrendLineChart({ values }: { values: number[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number; label: string } | null>(null);

  const { lineD, areaD, minV, maxV, dots, labels } = useMemo(() => {
    if (values.length < 2) {
      return { lineD: '', areaD: '', minV: 0, maxV: 1, dots: [] as { x: number; y: number }[], labels: [] as string[] };
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max(12, (max - min) * 0.12);
    const lo = min - pad;
    const hi = max + pad;
    const span = hi - lo || 1;
    const w = 100;
    const h = 36;
    const bottom = h - 2;
    const top = 4;
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = bottom - ((v - lo) / span) * (bottom - top);
      return { x, y };
    });

    const smoothD = pts.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
      const prev = pts[i - 1];
      const cpx1x = prev.x + (p.x - prev.x) * 0.5;
      const cpx1y = prev.y;
      const cpx2x = prev.x + (p.x - prev.x) * 0.5;
      const cpx2y = p.y;
      return `${acc} C ${cpx1x.toFixed(2)} ${cpx1y.toFixed(2)} ${cpx2x.toFixed(2)} ${cpx2y.toFixed(2)} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    }, '');

    const areaD = `${smoothD} L ${w} ${bottom} L 0 ${bottom} Z`;
    const lbls = ['较早', '', '', '', '', '', '近日'];
    return { lineD: smoothD, areaD, minV: min, maxV: max, dots: pts, labels: lbls };
  }, [values]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (dots.length < 2) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 100;
    let closest = dots[0];
    let minDist = Math.abs(svgX - closest.x);
    for (const d of dots) {
      const dist = Math.abs(svgX - d.x);
      if (dist < minDist) {
        minDist = dist;
        closest = d;
      }
    }
    const idx = dots.indexOf(closest);
    const labelText = labels[idx] || `第${idx + 1}天`;
    setTooltip({ x: closest.x, y: closest.y, value: values[idx], label: labelText });
  };

  const handleMouseLeave = () => setTooltip(null);

  if (!lineD) {
    return (
      <div className="flyvio-trend-chart flyvio-trend-chart--empty" aria-hidden>
        <span className="flyvio-trend-chart__empty">暂无趋势数据</span>
      </div>
    );
  }

  return (
    <div className="flyvio-trend-chart" role="img" aria-label={`近段价格约 ¥${minV}–¥${maxV} 走势示意`}>
      <svg
        className="flyvio-trend-chart__svg"
        viewBox="0 0 100 36"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="flyvio-trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--flyvio-cyan)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--flyvio-cyan)" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <path className="flyvio-trend-chart__area" d={areaD} fill="url(#flyvio-trend-fill)" />
        <path className="flyvio-trend-chart__grid" d="M0 18 H100" fill="none" />
        <path className="flyvio-trend-chart__line" d={lineD} fill="none" />
        {tooltip && (
          <>
            <line
              x1={tooltip.x}
              y1={2}
              x2={tooltip.x}
              y2={34}
              stroke="var(--flyvio-cyan)"
              strokeWidth="0.5"
              strokeDasharray="2 1"
              opacity="0.5"
            />
            <circle cx={tooltip.x} cy={tooltip.y} r="2" fill="var(--flyvio-cyan)" />
          </>
        )}
      </svg>
      {tooltip && (
        <div
          className="flyvio-trend-tooltip"
          style={{
            left: `${(tooltip.x / 100) * 100}%`,
            top: `${((tooltip.y - 8) / 36) * 100}%`,
          }}
        >
          {tooltip.label}：¥{tooltip.value}
        </div>
      )}
      <div className="flyvio-trend-chart__axis" aria-hidden>
        <span>较早</span>
        <span>近日</span>
      </div>
    </div>
  );
}

export function HomeSmartModules() {
  const [trendRouteId, setTrendRouteId] = useState<string>(TREND_ROUTE_PRESETS[0].id);
  const trendRoute = useMemo(
    () => TREND_ROUTE_PRESETS.find((r) => r.id === trendRouteId) ?? TREND_ROUTE_PRESETS[0],
    [trendRouteId]
  );

  const [trendText, setTrendText] = useState<string | null>(null);
  const [trendHint, setTrendHint] = useState<string | null>(null);
  const [trendSeries, setTrendSeries] = useState<number[]>([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [monDep, setMonDep] = useState('北京');
  const [monArr, setMonArr] = useState('上海');
  const [monPrice, setMonPrice] = useState(550);

  useEffect(() => {
    let c = false;
    setTrendLoading(true);
    setTrendText(null);
    setTrendHint(null);
    setTrendSeries([]);
    api
      .aiPriceTrend({
        depCity: trendRoute.depCity,
        arrCity: trendRoute.arrCity,
        depDate: trendRoute.depDate,
      })
      .then((r) => {
        if (c) return;
        setTrendText(r.suggestion === 'buy_now' ? '当前可优先考虑入手' : '可继续观望或设目标价提醒');
        setTrendHint(r.summary);
        if (r.referenceMin != null && r.referenceAvg != null) {
          setTrendSeries(buildTrendSeries(r.referenceMin, r.referenceAvg));
        } else {
          setTrendSeries([]);
        }
      })
      .catch(() => {
        if (!c) {
          setTrendText('暂无样本，请换航程或日期');
          setTrendHint(null);
          setTrendSeries([]);
        }
      })
      .finally(() => {
        if (!c) setTrendLoading(false);
      });
    return () => {
      c = true;
    };
  }, [trendRoute.depCity, trendRoute.arrCity, trendRoute.depDate]);

  return (
    <section className="flyvio-smart-grid" aria-label="智能功能栏位">
      {/* 价格走势预测 */}
      <div className="flyvio-smart-card" id="flyvio-trend-section">
        <h3 className="flyvio-section-title">
          <span className="flyvio-smart-card__icon" aria-hidden>
            <TrendIcon />
          </span>
          价格走势预测
        </h3>
        <label className="flyvio-smart-label" htmlFor="flyvio-trend-route">
          航程筛选
        </label>
        <select
          id="flyvio-trend-route"
          className="flyvio-smart-select"
          value={trendRouteId}
          onChange={(e) => setTrendRouteId(e.target.value)}
        >
          {TREND_ROUTE_PRESETS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label} · {r.depDate}
            </option>
          ))}
        </select>
        <p className="flyvio-smart-card__d flyvio-smart-card__d--tight">
          基于演示样本的近期价格走向示意；切换航程将重新分析。
        </p>
        {trendLoading ? (
          <div className="flyvio-trend-chart flyvio-trend-chart--loading" aria-busy="true">
            <span className="flyvio-trend-chart__empty">分析中…</span>
          </div>
        ) : (
          <TrendLineChart values={trendSeries} />
        )}
        <p className="flyvio-smart-card__strong">{trendText || '加载中…'}</p>
        {trendHint && <p className="flyvio-smart-card__muted">{trendHint}</p>}
        <Link
          to={`/flights?depCity=${encodeURIComponent(trendRoute.depCity)}&arrCity=${encodeURIComponent(trendRoute.arrCity)}&depDate=${encodeURIComponent(trendRoute.depDate)}`}
          className="flyvio-smart-link"
        >
          查看该航线航班 →
        </Link>
      </div>

      {/* 低价趋势监控 */}
      <div className="flyvio-smart-card" id="flyvio-monitor-section">
        <h3 className="flyvio-section-title">
          <span className="flyvio-smart-card__icon" aria-hidden>
            <BellIcon />
          </span>
          低价趋势监控
        </h3>
        <p className="flyvio-smart-card__d">7天×24小时 目标价到价提醒（演示，需登录后保存）</p>
        <label className="flyvio-smart-label">航线</label>
        <div className="flyvio-smart-row">
          <input className="flyvio-smart-input" value={monDep} onChange={(e) => setMonDep(e.target.value)} />
          <span className="flyvio-smart-arrow">→</span>
          <input className="flyvio-smart-input" value={monArr} onChange={(e) => setMonArr(e.target.value)} />
        </div>
        <label className="flyvio-smart-label">目标价（含税）</label>
        <input
          className="flyvio-smart-input"
          type="number"
          value={monPrice}
          onChange={(e) => setMonPrice(Number(e.target.value))}
        />
        <Link
          to={`/me/monitors?dep=${encodeURIComponent(monDep)}&arr=${encodeURIComponent(monArr)}&price=${monPrice}`}
          className="flyvio-smart-btn"
        >
          前往监控页配置
        </Link>
      </div>
    </section>
  );
}
