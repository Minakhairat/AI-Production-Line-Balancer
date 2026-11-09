import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  ProductionLine,
  Operation,
  Workstation,
  Operator,
  CalculationResults,
  OptimizationScenario,
} from '../types/lineBalancing';
import { calculateLineBalancing } from '../services/calculationEngine';
import { generateOptimizationScenarios } from '../services/optimizationEngine';
import { SAMPLE_LINES } from '../services/sampleData';
import { getTranslation } from '../services/i18n';

export type ActiveTab =
  | 'dashboard'
  | 'yamazumi'
  | 'timeStudy'
  | 'operations'
  | 'precedence'
  | 'scenarios'
  | 'workstations'
  | 'operators'
  | 'lines'
  | 'report'
  | 'settings';

export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';

export interface LineContextType {
  line: ProductionLine;
  activeLine: ProductionLine;
  lines: ProductionLine[];
  results: CalculationResults;
  scenarios: OptimizationScenario[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  t: (key: string, fallback?: string) => string;
  selectedStationId: string | null;
  setSelectedStationId: (id: string | null) => void;
  selectedOperationId: string | null;
  setSelectedOperationId: (id: string | null) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  isOperationModalOpen: boolean;
  setIsOperationModalOpen: (open: boolean) => void;
  editingOperation: Operation | null;
  setEditingOperation: (op: Operation | null) => void;

  // Actions
  updateLine: (updated: Partial<ProductionLine>) => void;
  addOperation: (op: Operation) => void;
  updateOperation: (op: Operation) => void;
  deleteOperation: (id: string) => void;
  addWorkstation: (ws: Workstation) => void;
  updateWorkstation: (ws: Workstation) => void;
  deleteWorkstation: (id: string) => void;
  addOperator: (worker: Operator) => void;
  updateOperator: (worker: Operator) => void;
  deleteOperator: (id: string) => void;
  applyScenario: (scenarioId: string) => void;
  switchLinePreset: (presetId: string) => void;
  resetToSample: () => void;
  resetToSampleData: () => void;
}

const LineContext = createContext<LineContextType | undefined>(undefined);

const STORAGE_KEY = 'ai_line_balancer_state_v2';
const LANG_STORAGE_KEY = 'ai_line_balancer_lang_v2';
const THEME_STORAGE_KEY = 'ai_line_balancer_theme_v2';

export const LineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial line safely
  const [line, setLine] = useState<ProductionLine>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          Array.isArray(parsed.workstations) &&
          parsed.workstations.length > 0 &&
          Array.isArray(parsed.operations) &&
          parsed.operations.length > 0
        ) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved line state, loading default factory sample', e);
    }
    return SAMPLE_LINES[0];
  });

  // Default language to Arabic as requested by user
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'ar' || saved === 'en') return saved;
    } catch {}
    return 'ar';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [selectedOperationId, setSelectedOperationId] = useState<string | null>(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [isOperationModalOpen, setIsOperationModalOpen] = useState<boolean>(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);

  // Sync HTML lang and dir attribute
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {}
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // Sync theme
  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist line changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(line));
    } catch (e) {
      console.error('Failed to persist line state', e);
    }
  }, [line]);

  // Translation helper
  const t = (key: string, fallback?: string): string => {
    return getTranslation(language, key, fallback);
  };

  // Calculate results dynamically with crash protection
  const results = useMemo(() => {
    try {
      return calculateLineBalancing(line);
    } catch (err) {
      console.error('Calculation engine error, recovering safely:', err);
      return calculateLineBalancing(SAMPLE_LINES[0]);
    }
  }, [line]);

  // Calculate optimization scenarios with crash protection
  const scenarios = useMemo(() => {
    try {
      return generateOptimizationScenarios(line, results);
    } catch (err) {
      console.error('Optimization engine error, recovering safely:', err);
      return generateOptimizationScenarios(SAMPLE_LINES[0], results);
    }
  }, [line, results]);

  // CRUD handlers
  const updateLine = (updated: Partial<ProductionLine>) => {
    setLine((prev) => ({ ...prev, ...updated }));
  };

  const addOperation = (op: Operation) => {
    setLine((prev) => ({
      ...prev,
      operations: [...prev.operations, op],
    }));
  };

  const updateOperation = (op: Operation) => {
    setLine((prev) => ({
      ...prev,
      operations: prev.operations.map((o) => (o.id === op.id ? op : o)),
    }));
  };

  const deleteOperation = (id: string) => {
    setLine((prev) => ({
      ...prev,
      operations: prev.operations
        .filter((o) => o.id !== id)
        .map((o) => ({
          ...o,
          precedenceIds: (o.precedenceIds || []).filter((p) => p !== id),
        })),
    }));
  };

  const addWorkstation = (ws: Workstation) => {
    setLine((prev) => ({
      ...prev,
      workstations: [...prev.workstations, ws],
    }));
  };

  const updateWorkstation = (ws: Workstation) => {
    setLine((prev) => ({
      ...prev,
      workstations: prev.workstations.map((w) => (w.id === ws.id ? ws : w)),
    }));
  };

  const deleteWorkstation = (id: string) => {
    setLine((prev) => {
      const remainingStations = prev.workstations.filter((w) => w.id !== id);
      const fallbackStationId = remainingStations[0]?.id || 'ws-1';
      return {
        ...prev,
        workstations: remainingStations,
        operations: prev.operations.map((op) =>
          op.stationId === id ? { ...op, stationId: fallbackStationId } : op
        ),
      };
    });
  };

  const addOperator = (worker: Operator) => {
    setLine((prev) => ({
      ...prev,
      operators: [...prev.operators, worker],
    }));
  };

  const updateOperator = (worker: Operator) => {
    setLine((prev) => ({
      ...prev,
      operators: prev.operators.map((w) => (w.id === worker.id ? worker : w)),
    }));
  };

  const deleteOperator = (id: string) => {
    setLine((prev) => ({
      ...prev,
      operators: prev.operators.filter((w) => w.id !== id),
      operations: prev.operations.map((op) =>
        op.operatorId === id ? { ...op, operatorId: undefined } : op
      ),
    }));
  };

  const applyScenario = (scenarioId: string) => {
    const sc = scenarios.find((s) => s.id === scenarioId);
    if (!sc) return;

    setLine((prev) => {
      const updatedOps = [...prev.operations];
      sc.assignments.forEach((asg) => {
        asg.operationIds.forEach((opId) => {
          const target = updatedOps.find((o) => o.id === opId);
          if (target) {
            target.stationId = asg.stationId;
          }
        });
      });

      const assignedStationIds = new Set(sc.assignments.map((a) => a.stationId));
      let updatedStations = prev.workstations;
      if (scenarioId === 'scenario-b') {
        updatedStations = prev.workstations.filter((w) => assignedStationIds.has(w.id));
      }

      return {
        ...prev,
        workstations: updatedStations,
        operations: updatedOps,
      };
    });
  };

  const switchLinePreset = (presetId: string) => {
    const found = SAMPLE_LINES.find((l) => l.id === presetId);
    if (found) {
      setLine(JSON.parse(JSON.stringify(found)));
    }
  };

  const resetToSample = () => {
    setLine(JSON.parse(JSON.stringify(SAMPLE_LINES[0])));
  };

  return (
    <LineContext.Provider
      value={{
        line,
        activeLine: line,
        lines: SAMPLE_LINES,
        results,
        scenarios,
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        theme,
        setTheme,
        toggleTheme,
        t,
        selectedStationId,
        setSelectedStationId,
        selectedOperationId,
        setSelectedOperationId,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        isOperationModalOpen,
        setIsOperationModalOpen,
        editingOperation,
        setEditingOperation,
        updateLine,
        addOperation,
        updateOperation,
        deleteOperation,
        addWorkstation,
        updateWorkstation,
        deleteWorkstation,
        addOperator,
        updateOperator,
        deleteOperator,
        applyScenario,
        switchLinePreset,
        resetToSample,
        resetToSampleData: resetToSample,
      }}
    >
      {children}
    </LineContext.Provider>
  );
};

export const useLineBalancing = (): LineContextType => {
  const context = useContext(LineContext);
  if (!context) {
    throw new Error('useLineBalancing must be used within a LineProvider');
  }
  return context;
};
