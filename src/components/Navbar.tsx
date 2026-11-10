import React from 'react';
import { useLineBalancing } from '../context/LineContext';
import {
  Factory,
  Sparkles,
  Languages,
  Moon,
  Sun,
  Timer,
  Gauge,
  AlertTriangle,
  Menu,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    line,
    lines,
    switchLine,
    results,
    customLogo,
    language,
    setLanguage,
    theme,
    toggleTheme,
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    setActiveTab,
    t,
  } = useLineBalancing();

  const isOverCycle = results.lineCycleTime > results.taktTime;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand & Mobile Menu */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <BrandLogo
              className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform flex items-center justify-center bg-neutral-900 border border-neutral-200 dark:border-neutral-700/60 shrink-0"
              alt="AI Production Line Balancer Logo"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-neutral-900 dark:text-white">
                  AI Production Line Balancer
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  IE 4.0
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-medium truncate max-w-[200px] sm:max-w-none">
                {language === 'ar' ? 'نظام موازنة خطوط الإنتاج والتحسين بالذكاء الاصطناعي' : 'Assembly Line Balancing & Optimization System'}
              </p>
            </div>
          </div>

          {/* Quick Line Selector Dropdown */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs border border-neutral-200 dark:border-neutral-700/60">
            <span className="text-neutral-400 font-medium shrink-0">{t('activeLine')}:</span>
            <select
              value={line.id}
              onChange={(e) => switchLine(e.target.value)}
              className="bg-transparent text-neutral-900 dark:text-white font-bold cursor-pointer outline-none text-xs max-w-[210px] truncate"
              title={language === 'ar' ? 'التبديل بين خطوط وموديلات الإنتاج' : 'Switch Active Production Line Model'}
            >
              {lines.map((l) => (
                <option key={l.id} value={l.id} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Live Engineering Quick Badges */}
        <div className="hidden xl:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 font-mono">
            <span className="text-neutral-400">{t('taktTime')}:</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {results.taktTime.toFixed(1)}s
            </span>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono ${
              isOverCycle
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500 border border-rose-500/30'
                : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-white'
            }`}
          >
            <span className="text-neutral-400">{t('lineCycleTime')}:</span>
            <span className="font-bold">{results.lineCycleTime.toFixed(1)}s</span>
            {isOverCycle && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 font-mono">
            <span className="text-neutral-400">{t('lineEfficiency')}:</span>
            <span className="font-bold text-emerald-500">{results.lineEfficiency.toFixed(1)}%</span>
          </div>
        </div>

        {/* Right: Controls & AI Copilot CTA */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-xs transition-colors"
            title="Switch Language / تغيير اللغة"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Toggle Dark / Light Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
          </button>


          {/* AI Assistant Button */}
          <button
            onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-102"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">{t('askAi')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
