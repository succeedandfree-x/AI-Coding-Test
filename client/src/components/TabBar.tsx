import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: '首页', icon: '⌂' },
  { to: '/search', label: '机票', icon: '✈' },
  { to: '/orders', label: '订单', icon: '☰' },
  { to: '/me', label: '我的', icon: '○' },
];

export function TabBar() {
  return (
    <nav className="nexo-tabbar">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === '/'}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{t.icon}</span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
