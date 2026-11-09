import React, { useState } from 'react';
import { LineProvider, useLineBalancing } from './context/LineContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { YamazumiChart } from './components/YamazumiChart';
import { TimeStudyTable } from './components/TimeStudyTable';
import { PrecedenceGraph } from './components/PrecedenceGraph';
import { ScenarioComparisonView } from './components/ScenarioComparisonView';
import { WorkstationsView } from './components/WorkstationsView';
import { WorkersView } from './components/WorkersView';
import { ProductionLinesView } from './components/ProductionLinesView';
import { ReportView } from './components/ReportView';
import { SettingsView } from './components/SettingsView';
import { OperationModal } from './components/OperationModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';

const MainAppLayout: React.FC = () => {
  const { activeTab, language } = useLineBalancing();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Content Area */}
        <main
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all ${
            language === 'ar' ? 'lg:mr-64' : 'lg:ml-64'
          }`}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'yamazumi' && <YamazumiChart />}
            {activeTab === 'timeStudy' && <TimeStudyTable />}
            {activeTab === 'precedence' && <PrecedenceGraph />}
            {activeTab === 'scenarios' && <ScenarioComparisonView />}
            {activeTab === 'workstations' && <WorkstationsView />}
            {activeTab === 'operators' && <WorkersView />}
            {activeTab === 'lines' && <ProductionLinesView />}
            {activeTab === 'report' && <ReportView />}
            {activeTab === 'settings' && <SettingsView />}

            {/* Bottom Copyright Footer */}
            <footer className="pt-8 pb-4 mt-8 border-t border-neutral-200 dark:border-neutral-800/80 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {language === 'ar' ? 'تصميم وتطوير:' : 'Designed & Developed by:'}
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {language === 'ar' ? 'المهندس مينا خيرت' : 'Eng. Mina Khairat'}
                </span>
                <span className="hidden sm:inline text-neutral-400">|</span>
                <a
                  href="tel:01200224513"
                  className="font-mono text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  📱 01200224513
                </a>
              </div>
              <div className="text-[11px] text-neutral-400 font-mono">
                {language === 'ar'
                  ? 'جميع الحقوق محفوظة © 2026 - نظام موازنة خطوط الإنتاج والتحسين بالذكاء الاصطناعي'
                  : 'All Rights Reserved © 2026 | AI Production Line Balancer'}
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <OperationModal />
      <AIAssistantDrawer />
    </div>
  );
};

export default function App() {
  return (
    <LineProvider>
      <MainAppLayout />
    </LineProvider>
  );
}
