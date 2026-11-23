import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

const DISMISSED_KEY = 'olc-pwa-install-dismissed';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isAppleMobile() {
  return /iPhone|iPad|iPod/i.test(window.navigator.userAgent)
    || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
}

export default function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const appleMobile = isAppleMobile();

  useEffect(() => {
    if (!window.matchMedia('(max-width: 1023px)').matches || isStandalone()) return undefined;

    const onBeforeInstall = (event) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    const onInstalled = () => {
      setVisible(false);
      setInstallEvent(null);
      localStorage.setItem(DISMISSED_KEY, 'installed');
    };
    const onOpenInstallPrompt = () => setVisible(true);

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('olc:show-install-prompt', onOpenInstallPrompt);

    if (!localStorage.getItem(DISMISSED_KEY)) {
      const timer = window.setTimeout(() => setVisible(true), 2200);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', onBeforeInstall);
        window.removeEventListener('appinstalled', onInstalled);
        window.removeEventListener('olc:show-install-prompt', onOpenInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('olc:show-install-prompt', onOpenInstallPrompt);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'dismissed');
    setVisible(false);
  };

  const install = async () => {
    if (!installEvent) return;
    setInstalling(true);
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstalling(false);
    setInstallEvent(null);
    if (choice?.outcome === 'accepted') {
      localStorage.setItem(DISMISSED_KEY, 'installed');
      setVisible(false);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  return (
    <div className="pwa-install-backdrop" role="presentation" onClick={dismiss}>
      <section
        className="pwa-install-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
        onClick={event => event.stopPropagation()}
      >
        <button type="button" className="pwa-install-close" onClick={dismiss} aria-label="Close install prompt"><X size={18} /></button>
        <div className="pwa-install-icon"><Download size={25} /></div>
        <p className="pwa-install-eyebrow">OZONE LAPCARE COMMUNITY</p>
        <h2 id="pwa-install-title">Use the app on your phone</h2>
        <p className="pwa-install-copy">Add Ozone Community to your home screen for quick, full-screen access.</p>

        {appleMobile ? (
          <div className="pwa-install-steps">
            <span>In Safari, tap <Share size={15} aria-label="Share" /> <strong>Share</strong>, then choose <strong>Add to Home Screen</strong>.</span>
          </div>
        ) : !installEvent ? (
          <div className="pwa-install-steps">Open your browser menu <strong>⋮</strong> and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</div>
        ) : null}

        {installEvent && !appleMobile && (
          <button type="button" className="pwa-install-action" onClick={install} disabled={installing}>
            <Download size={17} /> {installing ? 'Opening install…' : 'Install app'}
          </button>
        )}
        <button type="button" className="pwa-install-later" onClick={dismiss}>Maybe later</button>
      </section>
    </div>
  );
}
