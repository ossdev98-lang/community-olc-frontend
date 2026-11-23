import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import MobileHeader from './MobileHeader.jsx';
import BottomNav from './BottomNav.jsx';
import { useIsMobile } from '../../hooks/useIsMobile.js';

export default function AppLayout() {
  const isMobile = useIsMobile(1024);
  const location = useLocation();
  const showMobileHeader = location.pathname === '/dashboard';
  const isMobileChat = location.pathname.startsWith('/inquiries/');

  if (isMobile) {
    return (
      <div className={`app-shell app-shell-mobile${isMobileChat ? ' app-shell-chat' : ''}`}>
        {showMobileHeader && <MobileHeader />}
        <main className={`app-main app-main-mobile${isMobileChat ? ' app-main-chat' : showMobileHeader ? '' : ' app-main-no-header'}`}>
          <Outlet />
        </main>
        {!isMobileChat && <BottomNav />}
      </div>
    );
  }

  return (
    <div className="app-shell app-shell-desktop">
      <Sidebar />
      <div className="app-content">
        <Header />
        <main className="app-main app-main-desktop">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
