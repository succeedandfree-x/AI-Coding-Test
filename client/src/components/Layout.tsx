import { Outlet } from 'react-router-dom';
import { AiChatDock } from './AiChatDock';
import { TabBar } from './TabBar';
import { PcNavBar } from './PcNavBar';

export function Layout() {
  return (
    <>
      <PcNavBar />
      <Outlet />
      <TabBar />
      <AiChatDock />
    </>
  );
}
