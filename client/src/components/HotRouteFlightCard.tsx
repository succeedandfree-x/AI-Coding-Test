import { Link } from 'react-router-dom';
import type { HotRouteCard } from '../api';

type Props = {
  route: HotRouteCard;
  expanded: boolean;
  onToggleExpand: () => void;
};

export function HotRouteFlightCard({ route: r, expanded, onToggleExpand }: Props) {
  const searchUrl = `/search?dep=${encodeURIComponent(r.dep)}&arr=${encodeURIComponent(r.arr)}`;

  return (
    <article className="flyvio-hot-flight-card">
      <div className="flyvio-hot-flight-card__top">
        <div className="flyvio-hot-flight-card__airline">
          <div className="flyvio-hot-flight-card__logo" style={{ background: r.airlineColor }}>
            {r.airlineCode}
          </div>
          <div className="flyvio-hot-flight-card__airline-text">
            <div className="flyvio-hot-flight-card__airline-name">{r.airlineName}</div>
            <div className="flyvio-hot-flight-card__flight-no">{r.flightNo}</div>
          </div>
        </div>

        <div className="flyvio-hot-flight-card__timeline">
          <div className="flyvio-hot-flight-card__time-block">
            <div className="flyvio-hot-flight-card__clock">{r.depTime}</div>
            <div className="flyvio-hot-flight-card__apt">{r.depAirport}</div>
          </div>
          <div className="flyvio-hot-flight-card__connector">
            <span className="flyvio-hot-flight-card__dur">{r.durationText}</span>
            <div className="flyvio-hot-flight-card__line-track" aria-hidden>
              <span className="flyvio-hot-flight-card__line-dot" />
              <span className="flyvio-hot-flight-card__line-dash" />
              <span className="flyvio-hot-flight-card__line-arrow" />
            </div>
            <span className="flyvio-hot-flight-card__stop">{r.stopSummary}</span>
          </div>
          <div className="flyvio-hot-flight-card__time-block flyvio-hot-flight-card__time-block--end">
            <div className="flyvio-hot-flight-card__clock">{r.arrTime}</div>
            <div className="flyvio-hot-flight-card__apt">{r.arrAirport}</div>
          </div>
        </div>

        <div className="flyvio-hot-flight-card__buy">
          <span className="flyvio-hot-flight-card__badge">{r.badgeText}</span>
          <div className="flyvio-hot-flight-card__price">¥{r.totalPrice}</div>
          <div className="flyvio-hot-flight-card__tax">含税总价</div>
          <Link to={searchUrl} className="flyvio-hot-flight-card__select">
            选择
          </Link>
        </div>
      </div>

      <div className="flyvio-hot-flight-card__meta">
        <p className="flyvio-hot-flight-card__note">{r.transparencyNote}</p>

        <div className="flyvio-hot-flight-card__channels-label">全渠道比价快照</div>
        <div className="flyvio-hot-flight-card__channels">
          {r.channels.map((c) => (
            <span key={c.label} className="flyvio-hot-flight-card__channel-pill">
              {c.label} ¥{c.price}
            </span>
          ))}
        </div>

        {r.stopDetail && <p className="flyvio-hot-flight-card__stop-detail">{r.stopDetail}</p>}

        {r.riskNote && <span className="flyvio-hot-flight-card__risk">{r.riskNote}</span>}

        <p className="flyvio-hot-flight-card__baggage">{r.baggage}</p>

        {expanded && <p className="flyvio-hot-flight-card__detail-more">{r.detailExtra}</p>}

        <button type="button" className="flyvio-hot-flight-card__expand" onClick={onToggleExpand}>
          {expanded ? '收起详情 ▲' : '展开详情 ▼'}
        </button>
      </div>
    </article>
  );
}
