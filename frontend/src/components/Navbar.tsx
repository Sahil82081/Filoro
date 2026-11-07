import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layers,
  Menu,
  X,
  Search,
  Sun,
  Moon,
} from 'lucide-react';
import { ToolSearchModal } from './ToolSearchModal';
import { ToolPreviewModal } from './ToolPreviewModal';
import { ToolItem } from '../utils/toolsData';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll detection for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Tools', href: '/#tools' },
    { label: 'Convert', href: '/document-convert' },
    { label: 'Compress', href: '/pdf-compressor' },
    { label: 'Edit', href: '/pdf-organize' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('/#')) {
      const elementId = href.replace('/#', '');
      if (location.pathname === '/') {
        const el = document.getElementById(elementId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(href);
      }
    } else {
      navigate(href);
    }
  };

  return (
    <>
      <header className="sticky top-3.5 z-40 px-2 sm:px-4 w-full transition-all duration-300">
        <div
          className={`max-w-6xl mx-auto rounded-2xl sm:rounded-full px-4 sm:px-6 h-14 sm:h-15 flex items-center justify-between gap-3 border transition-all duration-300 ${
            isScrolled
              ? 'bg-[#FFFFFF]/95 dark:bg-[#1A1611]/95 backdrop-blur-xl border-[#E2DAC8] dark:border-[#383025] shadow-warm-elevated py-2'
              : 'bg-[#FFFFFF]/90 dark:bg-[#1A1611]/90 backdrop-blur-md border-[#EDE7D9] dark:border-[#332B20] shadow-warm-card py-2.5'
          }`}
        >
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFBF00] rounded-lg p-0.5"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF7900] via-[#FFBF00] to-[#FFE642] p-0.5 shadow-warm-sm group-hover:shadow-gold-glow transition-all duration-200">
              <div className="w-full h-full bg-[#FFFFFF] dark:bg-[#14110C] rounded-[9px] flex items-center justify-center transition-colors">
                <Layers className="w-4 h-4 text-[#FF7900] transition-transform duration-200 group-hover:scale-110" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-display font-bold tracking-tight text-[#202020] dark:text-[#FFFDF7] group-hover:text-[#FF7900] transition-colors">
                Filoro
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-medium">
            {navItems.map((item) => {
              const isHome = item.href === '/';
              const isTools = item.href === '/#tools';
              const isActive = isHome
                ? location.pathname === '/' && !location.hash
                : isTools
                ? location.hash === '#tools'
                : location.pathname.startsWith(item.href);

              const linkClasses = `relative px-3.5 py-1.5 rounded-full transition-colors duration-200 ${
                isActive
                  ? 'text-[#202020] dark:text-[#FFFDF7] font-semibold'
                  : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] hover:bg-[#F8F5EE] dark:hover:bg-[#221D16]'
              }`;

              return item.href.startsWith('/#') ? (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className={linkClasses}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbarActiveIndicator"
                      className="absolute -bottom-1 left-2.5 right-2.5 h-[2.5px] bg-[#FFBF00] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className={linkClasses}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbarActiveIndicator"
                      className="absolute -bottom-1 left-2.5 right-2.5 h-[2.5px] bg-[#FFBF00] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Theme Toggle, Search Trigger & Mobile Toggle */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full bg-[#F8F5EE] dark:bg-[#1E1913] hover:bg-[#FBF3DF] dark:hover:bg-[#2A231A] text-[#666666] dark:text-[#F2CF7E] hover:text-[#202020] dark:hover:text-[#FFBF00] border border-[#EDE7D9] dark:border-[#332B20] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFBF00]"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#FFBF00] transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-[#666666] transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {/* Search Trigger Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 min-h-[38px] rounded-full bg-[#F8F5EE] dark:bg-[#1E1913] hover:bg-[#FBF3DF] dark:hover:bg-[#2A231A] text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] text-xs font-medium border border-[#EDE7D9] dark:border-[#332B20] hover:border-[#F2CF7E] dark:hover:border-[#FFBF00]/50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFBF00]"
              aria-label="Search tools"
            >
              <Search className="w-3.5 h-3.5 text-[#FF7900]" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[#666666] dark:text-[#B8AF9F] bg-[#FFFFFF] dark:bg-[#14110C] border border-[#EDE7D9] dark:border-[#332B20] rounded">
                Ctrl K
              </kbd>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl text-[#202020] dark:text-[#FFFDF7] hover:bg-[#F8F5EE] dark:hover:bg-[#221D16] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFBF00]"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#FF7900]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            role="region"
            aria-label="Mobile Navigation"
            className="md:hidden border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF]/98 dark:bg-[#1A1611]/98 backdrop-blur-2xl rounded-2xl mx-auto mt-2 px-4 pt-3 pb-5 space-y-2 shadow-warm-elevated"
          >
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#202020] dark:text-[#FFFDF7] hover:bg-[#F8F5EE] dark:hover:bg-[#221D16] transition flex items-center justify-between"
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-[#EDE7D9] dark:border-[#332B20] flex items-center gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchModalOpen(true);
                }}
                className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#F8F5EE] dark:bg-[#221D16] text-[#202020] dark:text-[#FFFDF7] text-xs font-semibold"
              >
                <Search className="w-4 h-4 text-[#FF7900]" />
                <span>Search 27 Tools...</span>
              </button>
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-[#F8F5EE] dark:bg-[#221D16] text-[#666666] dark:text-[#F2CF7E] border border-[#EDE7D9] dark:border-[#332B20]"
                title="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FFBF00]" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Tool Search Modal */}
      <ToolSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectTool={(tool) => {
          setSearchModalOpen(false);
          setSelectedTool(tool);
        }}
      />

      {/* Quick Tool Inspection Modal */}
      <ToolPreviewModal
        tool={selectedTool}
        isOpen={Boolean(selectedTool)}
        onClose={() => setSelectedTool(null)}
      />
    </>
  );
};
