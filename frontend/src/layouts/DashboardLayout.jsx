import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import MorphicNavbar from '../components/MorphicNavbar';
import MotionBackdrop from '../components/MotionBackdrop';
import IntroAnimation from '../components/IntroAnimation';

export default function DashboardLayout({ title }) {
  const [showIntro, setShowIntro] = useState(() => {
    return sessionStorage.getItem("introPlayed") !== "true";
  });

  useEffect(() => {
    if (!showIntro) return;

    const timer = setTimeout(() => {
      sessionStorage.setItem("introPlayed", "true");
      setShowIntro(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [showIntro]);

  if (showIntro) {
    return (
      <IntroAnimation
        show={true}
        onComplete={() => {}}
      />
    );
  }

  return (
    <div className="app-shell min-h-screen text-[var(--color-text-primary)]">
      <MotionBackdrop />
      <div className="flex flex-col min-h-screen">
        <MorphicNavbar title={title} />
        <main className="relative flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="app-orb app-orb-one" aria-hidden="true" />
          <div className="app-orb app-orb-two" aria-hidden="true" />
          <div className="relative z-10 max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
