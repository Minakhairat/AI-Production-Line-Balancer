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
