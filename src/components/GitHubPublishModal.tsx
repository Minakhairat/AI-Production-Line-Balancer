import React, { useState } from 'react';
import { useLineBalancing } from '../context/LineContext';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  GitBranch,
  Terminal,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface GitHubPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPublishModal: React.FC<GitHubPublishModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLineBalancing();
  const [repoName, setRepoName] = useState('ai-production-line-balancer');
  const [username, setUsername] = useState('YOUR_USERNAME');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pushCommand = `git remote add origin https://github.com/${username}/${repoName}.git
git branch -M main
git push -u origin main`;

  const ghCliCommand = `gh repo create ${repoName} --public --source=. --push`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'نشر الموقع على جيت هاب' : 'Publish Project to GitHub'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                  Git Initialized ✓
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {language === 'ar'
                  ? 'تم تهيئة مستودع Git محلياً وتجهيز أول Commit بكل الملفات والمحرك الحسابي'
                  : 'Local repository initialized with all code and engineering engine committed'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs">
          {/* Step 1: Create repo on GitHub */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                <span>{language === 'ar' ? 'أنشئ مستودعاً جديداً على حسابك في GitHub' : 'Create a New Repository on GitHub'}</span>
              </span>

              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
              >
                <span>{language === 'ar' ? 'فتح github.com/new' : 'Open github.com/new'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-neutral-500 pl-7">
              {language === 'ar'
                ? 'قم بإنشاء مستودع فارغ (لا تضع علامة على "Add a README file" لأن المشروع يحتوي بالفعل على README شامل جاهز).'
                : 'Create an empty repository (leave "Add a README file" unchecked as the project already contains a full README).'}
            </p>
          </div>

          {/* Config: Enter Username and Repo Name */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <span className="font-bold text-neutral-700 dark:text-neutral-300 block">
              {language === 'ar' ? 'أدخل اسم حسابك ومستودعك لضبط الأوامر تلقائياً:' : 'Enter your GitHub username to customize commands:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 mb-1">
                  {language === 'ar' ? 'اسم المستخدم (GitHub Username)' : 'GitHub Username'}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.trim() || 'YOUR_USERNAME')}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-neutral-900 dark:text-white"
                  placeholder="e.g. minakhairat"
                />
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">
                  {language === 'ar' ? 'اسم المستودع (Repo Name)' : 'Repository Name'}
                </label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value.trim() || 'ai-production-line-balancer')}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Copy Commands */}
          <div className="space-y-2">
            <span className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
              <span>{language === 'ar' ? 'انسخ الأوامر التالية ونفذها في الـ Terminal' : 'Run the following commands in your Terminal'}</span>
            </span>

            <div className="relative group">
              <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto leading-relaxed border border-neutral-800">
                <code>{pushCommand}</code>
              </pre>

              <button
                onClick={() => handleCopy(pushCommand)}
                className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition-colors shadow"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'نسخ الأوامر' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Alternative with GitHub CLI */}
          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="font-medium flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'أو بنقرة واحدة باستخدام GitHub CLI (gh):' : 'Or via GitHub CLI (gh):'}</span>
              </span>
              <button
                onClick={() => handleCopy(ghCliCommand)}
                className="text-blue-500 hover:text-blue-400 font-medium text-[11px]"
              >
                {language === 'ar' ? 'نسخ أمر gh' : 'Copy gh command'}
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px] text-neutral-800 dark:text-neutral-200">
              <code>{ghCliCommand}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-950/80 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
          <span className="text-neutral-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{language === 'ar' ? 'تم تجهيز ملف README.md و .gitignore تلقائياً' : 'README.md and .gitignore are pre-configured'}</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium transition-colors"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
