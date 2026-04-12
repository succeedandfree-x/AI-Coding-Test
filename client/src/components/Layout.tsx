import { Outlet } from 'react-router-dom';
import { AiChatDock } from './AiChatDock';
import { TabBar } from './TabBar';

export function Layout() {
  return (
    <>
      <Outlet />
      <TabBar />
      <AiChatDock />
    </>
  );
}
