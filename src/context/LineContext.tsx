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
  activeLineId: string;
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
  customLogo: string | null;
  setCustomLogo: (logo: string | null) => void;

  // Actions on Active Line & Multiple Lines
  updateLine: (updated: Partial<ProductionLine>) => void;
  createLine: (newLine: ProductionLine) => void;
  duplicateLine: (lineId: string) => void;
  deleteLine: (lineId: string) => void;
  switchLine: (lineId: string) => void;
  switchLinePreset: (presetId: string) => void;
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
  importDatabase: (importedLines: ProductionLine[]) => void;
  exportDatabase: () => void;
  resetToSample: () => void;
  resetToSampleData: () => void;
}

const LineContext = createContext<LineContextType | undefined>(undefined);

const LINES_STORAGE_KEY = 'ai_line_balancer_lines_v3';
const ACTIVE_ID_STORAGE_KEY = 'ai_line_balancer_active_id_v3';
const LEGACY_STORAGE_KEY = 'ai_line_balancer_state_v2';
const LANG_STORAGE_KEY = 'ai_line_balancer_lang_v2';
const THEME_STORAGE_KEY = 'ai_line_balancer_theme_v2';
const LOGO_STORAGE_KEY = 'ai_line_balancer_custom_logo_v1';

export const LineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial lines list safely
  const [lines, setLines] = useState<ProductionLine[]>(() => {
    try {
      const savedLines = localStorage.getItem(LINES_STORAGE_KEY);
      if (savedLines) {
        const parsed = JSON.parse(savedLines);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].workstations && parsed[0].operations) {
          return parsed;
        }
      }

      // Check legacy single-line storage
      const legacySaved = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacySaved) {
        const parsedLegacy = JSON.parse(legacySaved);
        if (parsedLegacy && parsedLegacy.workstations && parsedLegacy.operations) {
          const merged = [parsedLegacy, ...SAMPLE_LINES.filter((s) => s.id !== parsedLegacy.id)];
          return merged;
        }
      }
    } catch (e) {
      console.warn('Could not read saved lines list, loading default factory benchmark lines', e);
    }
    return JSON.parse(JSON.stringify(SAMPLE_LINES));
  });

  // Track active line ID
  const [activeLineId, setActiveLineId] = useState<string>(() => {
    try {
      const savedActiveId = localStorage.getItem(ACTIVE_ID_STORAGE_KEY);
      if (savedActiveId) return savedActiveId;
    } catch {}
    return lines[0]?.id || SAMPLE_LINES[0].id;
  });

  // Active line is always the item matching activeLineId
  const line = useMemo<ProductionLine>(() => {
    const found = lines.find((l) => l.id === activeLineId);
    if (found) return found;
    return lines[0] || SAMPLE_LINES[0];
  }, [lines, activeLineId]);

  // Custom Logo State with localStorage persistence
  const [customLogo, setCustomLogoState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOGO_STORAGE_KEY);
    } catch {}
    return null;
  });

  const setCustomLogo = (logo: string | null) => {
    setCustomLogoState(logo);
    try {
      if (logo) {
        localStorage.setItem(LOGO_STORAGE_KEY, logo);
      } else {
        localStorage.removeItem(LOGO_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save logo to storage', e);
    }
  };

  // Sync favicon with custom logo or default svg
  useEffect(() => {
    const iconLinks = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
    const logoUrl = customLogo || '/favicon.svg';
    iconLinks.forEach((el) => {
      el.href = logoUrl;
    });
  }, [customLogo]);

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

  // Persist all lines to localStorage whenever lines array changes
  useEffect(() => {
    try {
      localStorage.setItem(LINES_STORAGE_KEY, JSON.stringify(lines));
      localStorage.setItem(ACTIVE_ID_STORAGE_KEY, activeLineId);
      // Keep legacy key in sync for backwards compatibility
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(line));
    } catch (e) {
      console.error('Failed to persist lines database to storage', e);
    }
  }, [lines, activeLineId, line]);

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

  // Update active line parameters
  const updateLine = (updated: Partial<ProductionLine>) => {
    setLines((prev) =>
      prev.map((l) => (l.id === line.id ? { ...l, ...updated } : l))
    );
  };

  // Create and activate a brand new line
  const createLine = (newLine: ProductionLine) => {
    setLines((prev) => [...prev, newLine]);
    setActiveLineId(newLine.id);
  };

  // Duplicate an existing line to test variants / product models
  const duplicateLine = (lineId: string) => {
    const target = lines.find((l) => l.id === lineId) || line;
    const cloned: ProductionLine = JSON.parse(JSON.stringify(target));
    const newId = `line-${Date.now().toString().slice(-6)}`;
    cloned.id = newId;
    cloned.name = `${target.name} (${language === 'ar' ? 'نسخة مكررة' : 'Copy'})`;
    setLines((prev) => [...prev, cloned]);
    setActiveLineId(newId);
  };

  // Delete a line
  const deleteLine = (lineId: string) => {
    if (lines.length <= 1) {
      return;
    }

    const remaining = lines.filter((l) => l.id !== lineId);
    setLines(remaining);
    if (activeLineId === lineId) {
      setActiveLineId(remaining[0].id);
    }
  };

  // Switch active line
  const switchLine = (lineId: string) => {
    const target = lines.find((l) => l.id === lineId);
    if (target) {
      setActiveLineId(target.id);
    }
  };

  const switchLinePreset = (presetId: string) => {
    switchLine(presetId);
  };

  // CRUD Operations on Active Line
  const addOperation = (op: Operation) => {
    setLines((prev) =>
      prev.map((l) =>
        l.id === line.id ? { ...l, operations: [...l.operations, op] } : l
      )
    );
  };

  const updateOperation = (op: Operation) => {
    setLines((prev) =>
      prev.map((l) =>
        l.id === line.id
          ? { ...l, operations: l.operations.map((o) => (o.id === op.id ? op : o)) }
          : l
      )
    );
  };

  const deleteOperation = (id: string) => {
    setLines((prev) =>
      prev.map((l) =>
        l.id === line.id
          ? {
              ...l,
              operations: l.operations
                .filter((o) => o.id !== id)
                .map((o) => ({
                  ...o,
                  precedenceIds: (o.precedenceIds || []).filter((p) => p !== id),
                })),
            }
          : l
      )
    );
  };

  const addWorkstation = (ws: Workstation) => {
    setLines((prev) =>
      prev.map((l) =>
        l.id === line.id ? { ...l, workstations: [...l.workstations, ws] } : l
      )
    );
  };

  const updateWorkstation = (ws: Workstation) => {
    setLines((prev) =>
      prev.map((l) =>
        l.id === line.id
          ? { ...l, workstations: l.workstations.map((w) => (w.id === ws.id ? ws : w)) }
          : l
      )
    );
  };

  const deleteWorkstation = (id: string) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== line.id) return l;
        const remainingStations = l.workstations.filter((w) => w.id !== id);
        const fallbackStationId = remainingStations[0]?.id || 'ws-1';
        return {
          ...l,
          workstations: remainingStations,
          operations: l.operations.map((op) =>
            op.stationId === id ? { ...op, stationId: fallbackStationId } : op
          ),
        };
      })
    );
  };

  const addOperator = (worker: Operator) => {
    setLines((prev) =>
      prev.map((l) =>
        l.id === line.id ? { ...l, operators: [...l.operators, worker] } : l
      )
    );
  };

  const updateOperator = (worker: Operator) => {
    setLines((prev) =>
      prev.map((l) =>
        l.id === line.id
          ? { ...l, operators: l.operators.map((w) => (w.id === worker.id ? worker : w)) }
          : l
      )
    );
  };

  const deleteOperator = (id: string) => {
    setLines((prev) =>
      prev.map((l) =>
        l.id === line.id
          ? {
              ...l,
              operators: l.operators.filter((w) => w.id !== id),
              operations: l.operations.map((op) =>
                op.operatorId === id ? { ...op, operatorId: undefined } : op
              ),
            }
          : l
      )
    );
  };

  const applyScenario = (scenarioId: string) => {
    const sc = scenarios.find((s) => s.id === scenarioId);
    if (!sc) return;

    setLines((prevLines) =>
      prevLines.map((l) => {
        if (l.id !== line.id) return l;

        const updatedOps = [...l.operations];
        sc.assignments.forEach((asg) => {
          asg.operationIds.forEach((opId) => {
            const target = updatedOps.find((o) => o.id === opId);
            if (target) {
              target.stationId = asg.stationId;
            }
          });
        });

        const assignedStationIds = new Set(sc.assignments.map((a) => a.stationId));
        let updatedStations = l.workstations;
        if (scenarioId === 'scenario-b') {
          updatedStations = l.workstations.filter((w) => assignedStationIds.has(w.id));
        }

        return {
          ...l,
          workstations: updatedStations,
          operations: updatedOps,
        };
      })
    );
  };

  // Full Database Backup Import & Export
  const importDatabase = (importedLines: ProductionLine[]) => {
    if (Array.isArray(importedLines) && importedLines.length > 0) {
      setLines(importedLines);
      setActiveLineId(importedLines[0].id);
      try {
        localStorage.setItem(LINES_STORAGE_KEY, JSON.stringify(importedLines));
        localStorage.setItem(ACTIVE_ID_STORAGE_KEY, importedLines[0].id);
      } catch {}
    }
  };

  const exportDatabase = () => {
    const exportPayload = {
      system: 'AI Production Line Balancer',
      version: '2.4',
      exportDate: new Date().toISOString(),
      activeLineId,
      lines,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AI_Line_Balancer_All_Lines_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Reset to default sample lines
  const resetToSample = () => {
    const freshSamples = JSON.parse(JSON.stringify(SAMPLE_LINES));
    setLines(freshSamples);
    setActiveLineId(freshSamples[0].id);
  };

  return (
    <LineContext.Provider
      value={{
        line,
        activeLine: line,
        lines,
        activeLineId,
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
        customLogo,
        setCustomLogo,
        updateLine,
        createLine,
        duplicateLine,
        deleteLine,
        switchLine,
        switchLinePreset,
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
        importDatabase,
        exportDatabase,
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
