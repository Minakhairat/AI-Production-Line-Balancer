import React from 'react';
import { useLineBalancing, ActiveTab } from '../context/LineContext';
import {
  LayoutDashboard,
  Sliders,
  Clock,
  GitCommit,
  Sparkles,
  Layers,
  Users,
  Factory,
  FileText,
  Settings,
  AlertTriangle,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { line, results, activeTab, setActiveTab, language, t } = useLineBalancing();

  const navItems: { tab: ActiveTab; labelKey: string; icon: any; badge?: string }[] = [
    { tab: 'dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    {
      tab: 'yamazumi',
      labelKey: 'lineBalancing',
      icon: Sliders,
      badge: results.bottlenecks.length > 0 ? `${results.bottlenecks.length}` : undefined,
    },
    { tab: 'timeStudy', labelKey: 'timeStudy', icon: Clock },
    { tab: 'precedence', labelKey: 'precedence', icon: GitCommit },
    { tab: 'scenarios', labelKey: 'aiOptimization', icon: Sparkles },
    { tab: 'workstations', labelKey: 'operationsManagement', icon: Layers },
    { tab: 'operators', labelKey: 'workersManagement', icon: Users },
    { tab: 'lines', labelKey: 'productionLines', icon: Factory },
    { tab: 'report', labelKey: 'reports', icon: FileText },
    { tab: 'settings', labelKey: 'settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 z-40 w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-transform lg:translate-x-0 ${
          language === 'ar' ? 'right-0 border-l border-r-0' : 'left-0'
        } ${isOpen ? 'translate-x-0' : language === 'ar' ? 'translate-x-full' : '-translate-x-full'} flex flex-col justify-between p-4 overflow-y-auto`}
      >
        <div className="space-y-6">
          {/* Mobile close button */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="font-bold text-xs uppercase tracking-wider text-neutral-400">
              {language === 'ar' ? 'القائمة الرئيسية' : 'Navigation Menu'}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;

              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    setActiveTab(item.tab);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{t(item.labelKey)}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Line Info Footnote */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-[11px] space-y-1 text-neutral-400">
          <div className="font-bold text-neutral-700 dark:text-neutral-300 truncate">
            {line.name}
          </div>
          <div className="flex justify-between">
            <span>{language === 'ar' ? 'الطلب:' : 'Demand:'}</span>
            <span className="font-mono text-neutral-600 dark:text-neutral-400">
              {line.customerDemand} {language === 'ar' ? 'قطعة' : 'u'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{language === 'ar' ? 'زمن التاكت:' : 'Takt:'}</span>
            <span className="font-mono font-bold text-blue-500">
              {results.taktTime.toFixed(1)}s
            </span>
          </div>
          <div className="flex justify-between">
            <span>{language === 'ar' ? 'طاقة الوردية:' : 'Capacity:'}</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {results.shiftCapacity} {language === 'ar' ? 'قطعة' : 'u'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
