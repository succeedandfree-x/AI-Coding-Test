import { ReactNode } from 'react';

type Props = { title: string; right?: ReactNode };

export function TopNav({ title, right }: Props) {
  return (
    <header className="flyvio-topnav">
      <div className="flyvio-topnav__side flyvio-topnav__side--left" aria-hidden="true" />
      <div className="flyvio-topnav__brand">
        <div className="flyvio-topnav__brand-product">
          <span className="flyvio-topnav__brand-flyvio">FLYVIO</span>
          <span className="flyvio-topnav__brand-tag">— Fly easy, save more.</span>
        </div>
        {title ? <div className="flyvio-topnav__brand-page">{title}</div> : null}
      </div>
      <div className="flyvio-topnav__side flyvio-topnav__side--right">
        {right}
      </div>
    </header>
  );
}
