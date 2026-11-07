import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ToastProvider } from '../components/ui/Toast';

export const MainLayout: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // 2.5px top scroll-progress bar calculator
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-[#FFFDF7] dark:bg-[#14110C] text-[#202020] dark:text-[#FFFDF7] font-sans relative selection:bg-[#F2CF7E] selection:text-[#202020] transition-colors duration-250">
        {/* 1. Thin 2.5px Reading Progress Bar: Vibrant Orange (#FF7900) to Golden Yellow (#FFBF00) */}
        <div
          className="fixed top-0 left-0 right-0 h-[2.5px] z-50 pointer-events-none origin-left"
          role="progressbar"
          aria-valuenow={Math.round(scrollProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Reading progress"
        >
          <div
            className="h-full bg-gradient-to-r from-[#FF7900] via-[#FFBF00] to-[#FFE642] transition-[width] duration-75 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* 2. Attractive Warm Editorial Background Theme */}
        {/* Subtle Architectural Hairline Grid */}
        <div
          className="fixed inset-0 pointer-events-none z-0 warm-architectural-grid opacity-75 dark:opacity-60 transition-opacity duration-300"
          aria-hidden="true"
        />

        {/* Ambient Warm Champagne & Gold Glows */}
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          aria-hidden="true"
        >
          {/* Top-Right Soft Champagne Wash */}
          <div
            className="absolute -top-[120px] right-[-100px] w-[750px] h-[650px] rounded-full blur-[110px] opacity-45 dark:opacity-25 pointer-events-none transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle, #F2CF7E 0%, rgba(242, 207, 126, 0.15) 50%, transparent 75%)',
            }}
          />
          {/* Mid-Left Golden Glow */}
          <div
            className="absolute top-[32%] -left-[140px] w-[600px] h-[550px] rounded-full blur-[120px] opacity-25 dark:opacity-18 pointer-events-none transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle, #FFBF00 0%, rgba(255, 191, 0, 0.12) 50%, transparent 75%)',
            }}
          />
          {/* Bottom-Right Warm Amber Touch */}
          <div
            className="absolute bottom-[8%] -right-[120px] w-[650px] h-[550px] rounded-full blur-[130px] opacity-20 dark:opacity-15 pointer-events-none transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle, #FF7900 0%, rgba(255, 121, 0, 0.1) 50%, transparent 75%)',
            }}
          />
        </div>

        {/* Accessible Keyboard Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#FFBF00] focus:text-[#202020] focus:rounded-xl focus:shadow-warm-card focus:outline-none focus:ring-2 focus:ring-[#FF7900] text-xs font-bold transition"
        >
          Skip to main content
        </a>

        {/* Navigation Bar */}
        <div className="relative z-40">
          <Navbar />
        </div>

        {/* Main Content Area */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 focus:outline-none relative z-10"
        >
          <Outlet />
        </main>

        {/* Footer */}
        <div className="relative z-10">
          <Footer />
        </div>
      </div>
    </ToastProvider>
  );
};

export default MainLayout;
