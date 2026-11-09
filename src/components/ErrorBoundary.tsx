import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('ai_line_balancer_state_v2');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-neutral-800 border border-neutral-700 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-bold text-white">
              تم اكتشاف خطأ في عرض الواجهة | Display Error
            </h2>

            <p className="text-xs text-neutral-300 leading-relaxed">
              حدث خطأ غير متوقع أثناء معالجة بيانات خط الإنتاج. يمكنك استعادة بيانات المصنع الافتراضية والتعافي الفوري دون فقدان الإعدادات الأساسية.
            </p>

            {this.state.error && (
              <pre className="p-3 bg-neutral-950 text-neutral-400 rounded-xl text-[11px] font-mono overflow-x-auto text-left max-h-32">
                {this.state.error.message}
              </pre>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/30"
            >
              <RotateCcw className="w-4 h-4" />
              <span>استعادة البيانات النموذجية والمتابعة | Reset & Recover</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
