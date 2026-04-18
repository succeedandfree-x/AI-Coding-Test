import { NavLink } from 'react-router-dom';

const tabs = [
  {
    to: '/',
    label: '首页',
    icon: (
      <svg viewBox="0 0 24 24"><path d="M3 12l9-9 9 9" /><path d="M5 10v9a1 1 0 001 1h3a1 1 0 001-1v-4h4v4a1 1 0 001 1h3a1 1 0 001-1v-9" /></svg>
    ),
  },
  {
    to: '/search',
    label: '查票',
    icon: (
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>
    ),
  },
  {
    to: '/flights',
    label: '机票',
    icon: (
      <svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" /></svg>
    ),
  },
  {
    to: '/orders',
    label: '订单',
    icon: (
      <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h10M7 16h6" /></svg>
    ),
  },
  {
    to: '/me',
    label: '我的',
    icon: (
      <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0112 0v1" /></svg>
    ),
  },
];

export function TabBar() {
  return (
    <nav className="flyvio-tabbar">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === '/'}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <span className="flyvio-tabbar-icon">{t.icon}</span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
