import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

interface NavbarProps {
  activeTab: 'generator' | 'curriculum' | 'quiz' | 'saved';
  onSelectTab: (tab: 'generator' | 'curriculum' | 'quiz' | 'saved') => void;
  onOpenHelp: () => void;
  onNewPaperClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenHelp,
  onNewPaperClick,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onSelectTab('generator')}
            className="text-left font-bold text-lg md:text-xl text-slate-900 tracking-tight whitespace-nowrap shrink-0 hover:text-emerald-700 transition-colors"
          >
            এনসিটিবি প্রশ্নব্যাংক
          </button>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectTab('generator')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'generator'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                  : ''
              }`}
            >
              প্রশ্ন প্রস্তুতকারক
            </button>
            <button
              onClick={() => onSelectTab('curriculum')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'curriculum'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                  : ''
              }`}
            >
              পাঠ্যক্রম ব্রাউজার
            </button>
            <button
              onClick={() => onSelectTab('quiz')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'quiz'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                  : ''
              }`}
            >
              মক টেস্ট ও কুইজ
            </button>
            <button
              onClick={() => onSelectTab('saved')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'saved'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                  : ''
              }`}
            >
              সংরক্ষিত প্রশ্ন
            </button>
            <button
              onClick={onOpenHelp}
              className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
              title="পূর্বের সমস্যা ও স্থাপত্য সমাধান"
            >
              <HelpCircle className="w-4 h-4" />
              <span>সহায়িকা</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNewPaperClick}
              className="px-4 py-2 text-xs md:text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>নতুন প্রশ্নপত্র তৈরি</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
