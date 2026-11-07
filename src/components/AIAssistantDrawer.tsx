import React, { useState, useRef, useEffect } from 'react';
import { useLineBalancing } from '../context/LineContext';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Loader2,
  HelpCircle,
  TrendingDown,
  Layers,
  Zap,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIAssistantDrawer: React.FC = () => {
  const { line, results, scenarios, isAiDrawerOpen, setIsAiDrawerOpen, language, t } =
    useLineBalancing();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        language === 'ar'
          ? `أهلاً بك! أنا مستشارك الهندسي الذكي المتخصص في هندسة النظم وتوازن خطوط الإنتاج.
قمت بتحليل بيانات خط (${line.name}):
• زمن التاكت المحسوب: ${results.taktTime.toFixed(1)} ثانية
• زمن دورة الخط (عنق الزجاجة): ${results.lineCycleTime.toFixed(1)} ثانية
• كفاءة التوازن: ${results.lineEfficiency.toFixed(1)}% (نسبة الفاقد: ${results.balanceDelay.toFixed(1)}%)
• المحطات الحرجة: ${results.bottlenecks.join(', ')}

كيف يمكنني مساعدتك اليوم في تحسين الخط أو تقليص التكاليف؟`
          : `Hello! I am your AI Industrial Engineering Advisor.
I have analyzed your assembly line (${line.name}):
• Target Takt Time: ${results.taktTime.toFixed(1)}s
• Current Line Cycle Time: ${results.lineCycleTime.toFixed(1)}s
• Line Balancing Efficiency: ${results.lineEfficiency.toFixed(1)}% (Delay: ${results.balanceDelay.toFixed(1)}%)
• Bottlenecks: ${results.bottlenecks.join(', ')}

How can I assist you in optimizing cycle times or reducing waste?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isAiDrawerOpen) return null;

  const quickPrompts =
    language === 'ar'
      ? [
          'كيف يمكن التخلص من عنق الزجاجة في المحطة الحالية؟',
          'قارن بين سيناريو تسوية الأحمال (A) وتقليص العمالة (B)',
          'هل يمكن تلبية طلب العميل بدون ساعات عمل إضافية؟',
          'اقترح خطة كايزن لتقليص أوقات المشي والمناولة المهدورة',
        ]
      : [
          'How can we eliminate the critical bottleneck in this line?',
          'Compare Scenario A (Leveling) vs Scenario B (Lean Headcount)',
          'Can we satisfy customer demand without scheduling overtime?',
          'Suggest a Kaizen action plan to reduce walking and handling waste',
        ];

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          language,
          context: {
            lineName: line.name,
            productModel: line.productModel,
            customerDemand: line.customerDemand,
            shiftDurationHours: line.shiftDurationHours,
            netAvailableTime: Math.round(results.netAvailableTime),
            taktTime: Number(results.taktTime.toFixed(2)),
            lineCycleTime: Number(results.lineCycleTime.toFixed(2)),
            lineEfficiency: Number(results.lineEfficiency.toFixed(2)),
            balanceDelay: Number(results.balanceDelay.toFixed(2)),
            bottlenecks: results.bottlenecks,
            actualStations: line.workstations.length,
            theoreticalMinStations: results.theoreticalMinStations,
            shiftCapacity: results.shiftCapacity,
            hourlyCapacity: Number(results.hourlyCapacity.toFixed(1)),
            totalIdleTimePerShift: Number(results.totalIdleTimePerShift.toFixed(1)),
            workstations: results.workstationMetrics.map((w) => ({
              id: w.id,
              name: w.name,
              cycleTime: Number(w.cycleTime.toFixed(1)),
              utilization: Number(w.utilization.toFixed(1)),
              isBottleneck: w.isBottleneck,
              operationsCount: w.operations.length,
            })),
            scenarios: scenarios.map((s) => ({
              id: s.id,
              name: s.name,
              cycleTime: Number(s.metrics.lineCycleTime.toFixed(1)),
              efficiency: Number(s.metrics.lineEfficiency.toFixed(1)),
              stations: s.assignments.length,
              transfersCount: s.transfers.length,
            })),
          },
        }),
      });

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'Unable to generate technical analysis.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text:
            language === 'ar'
              ? 'حدث خطأ في الاتصال بالمساعد الهندسي. يرجى المحاولة مرة أخرى.'
              : 'Error connecting to AI service. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div
        className={`w-full max-w-lg h-full bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col justify-between ${
          language === 'ar' ? 'border-r border-l-0' : ''
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                {t('aiAssistantTitle')}
              </h3>
              <p className="text-[10px] text-neutral-400">
                {language === 'ar' ? 'مبني على حسابات دقيقة للهندسة الصناعية' : 'Grounded in deterministic IE calculations'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAiDrawerOpen(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-tl-none border border-neutral-200 dark:border-neutral-700/60'
                }`}
              >
                {m.text}
                <div
                  className={`text-[9px] mt-1.5 text-right font-mono ${
                    m.sender === 'user' ? 'text-blue-200' : 'text-neutral-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-xs text-neutral-400">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span>{t('aiThinking')}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/40">
          <span className="text-[10px] font-bold text-neutral-400 block mb-1.5">
            {t('suggestedInquiries')}
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                disabled={isLoading}
                onClick={() => handleSend(qp)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 transition-colors text-left"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={t('aiAssistantPlaceholder')}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
