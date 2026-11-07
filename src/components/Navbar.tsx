import React, { useState } from 'react';
import { useLineBalancing } from '../context/LineContext';
import { GitHubPublishModal } from './GitHubPublishModal';
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

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const {
    line,
    results,
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Factory className="w-5 h-5" />
            </div>
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

          {/* GitHub Publish Button */}
          <button
            onClick={() => setIsGithubModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 font-semibold text-xs transition-opacity shadow-sm"
            title="Publish to GitHub / النشر على جيت هاب"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="hidden sm:inline">GitHub</span>
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

      {/* GitHub Publish Modal */}
      <GitHubPublishModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
      />
    </header>
  );
};
