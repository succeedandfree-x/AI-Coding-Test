import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = { title: string; right?: ReactNode; showSearch?: boolean };

export function TopNav({ title, right, showSearch }: Props) {
  return (
    <header className="nexo-topnav">
      <div className="nexo-topnav__side nexo-topnav__side--left" aria-hidden="true" />
      <div className="nexo-topnav__brand">
        <div className="nexo-topnav__brand-product">
          <span className="nexo-topnav__brand-flyvio">Flyvio</span>
          <span className="nexo-topnav__brand-tag"> — Fly easy, save more.</span>
        </div>
        {title ? <div className="nexo-topnav__brand-page">{title}</div> : null}
      </div>
      <div className="nexo-topnav__side nexo-topnav__side--right">
        {showSearch && (
          <Link to="/search" className="nexo-topnav__search">
            搜索
          </Link>
        )}
        {right}
      </div>
    </header>
  );
}
