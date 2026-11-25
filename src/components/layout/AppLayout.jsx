import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import MobileHeader from './MobileHeader.jsx';
import BottomNav from './BottomNav.jsx';
import { useIsMobile } from '../../hooks/useIsMobile.js';

export default function AppLayout() {
  const shellRef = useRef(null);
  const isMobile = useIsMobile(1024);
  const location = useLocation();
  const showMobileHeader = location.pathname === '/dashboard';
  const isMobileChat = location.pathname.startsWith('/inquiries/');

  useEffect(() => {
    if (!isMobile || !isMobileChat) return;
    const shell = shellRef.current;
    const viewport = window.visualViewport;
    const updateHeight = () => {
      if (shell) shell.style.setProperty('--chat-viewport-height', `${viewport?.height || window.innerHeight}px`);
    };
    updateHeight();
    viewport?.addEventListener('resize', updateHeight);
    viewport?.addEventListener('scroll', updateHeight);
    window.addEventListener('resize', updateHeight);
    return () => {
      viewport?.removeEventListener('resize', updateHeight);
      viewport?.removeEventListener('scroll', updateHeight);
      window.removeEventListener('resize', updateHeight);
      shell?.style.removeProperty('--chat-viewport-height');
    };
  }, [isMobile, isMobileChat]);

  if (isMobile) {
    return (
      <div ref={shellRef} className={`app-shell app-shell-mobile${isMobileChat ? ' app-shell-chat' : ''}`}>
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
