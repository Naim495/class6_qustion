/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { GeneratorForm } from './components/GeneratorForm.tsx';
import { QuestionPaperView } from './components/QuestionPaperView.tsx';
import { CurriculumBrowser } from './components/CurriculumBrowser.tsx';
import { QuizMode } from './components/QuizMode.tsx';
import { SavedPapers } from './components/SavedPapers.tsx';
import { WhyPreviousFailedModal } from './components/WhyPreviousFailedModal.tsx';
import { PRELOADED_QUESTION_SETS } from './data/nctbData.ts';
import { QuestionPaper, SubjectId } from './types.ts';
import { Sparkles, ArrowLeft, BookOpen, CheckCircle, FileQuestion, GraduationCap } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'nctb_class6_saved_papers_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'curriculum' | 'quiz' | 'saved'>('generator');
  const [generatorView, setGeneratorView] = useState<'form' | 'paper'>('paper'); // default to paper so users instantly see a rich sample!
  const [currentPaper, setCurrentPaper] = useState<QuestionPaper>(PRELOADED_QUESTION_SETS['science-sample']);
  const [savedPapers, setSavedPapers] = useState<QuestionPaper[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Cross-component pre-selection
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>('science');
  const [selectedChapterId, setSelectedChapterId] = useState<string | undefined>(undefined);

  // Load saved papers from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedPapers(parsed);
          return;
        }
      }
      // Seed with initial sample paper if empty
      const initial = [PRELOADED_QUESTION_SETS['science-sample']];
      setSavedPapers(initial);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    } catch (e) {
      console.error('Error loading saved papers:', e);
    }
  }, []);

  const handleSavePaper = (paperToSave: QuestionPaper) => {
    const existingIndex = savedPapers.findIndex((p) => p.id === paperToSave.id);
    let updated: QuestionPaper[];
    if (existingIndex >= 0) {
      updated = [...savedPapers];
      updated[existingIndex] = paperToSave;
    } else {
      updated = [paperToSave, ...savedPapers];
    }
    setSavedPapers(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving paper:', e);
    }
  };

  const handleDeletePaper = (id: string) => {
    const updated = savedPapers.filter((p) => p.id !== id);
    setSavedPapers(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error deleting paper:', e);
    }
  };

  const handlePaperGenerated = (paper: QuestionPaper) => {
    setCurrentPaper(paper);
    handleSavePaper(paper);
    setGeneratorView('paper');
    setActiveTab('generator');
  };

  const handleSelectChapterForGenerator = (subjectId: SubjectId, chapterId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedChapterId(chapterId);
    setGeneratorView('form');
    setActiveTab('generator');
  };

  const handleSelectSavedPaper = (paper: QuestionPaper) => {
    setCurrentPaper(paper);
    setGeneratorView('paper');
    setActiveTab('generator');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'generator' && !currentPaper) {
            setGeneratorView('form');
          }
        }}
        onOpenHelp={() => setIsHelpOpen(true)}
        onNewPaperClick={() => {
          setActiveTab('generator');
          setGeneratorView('form');
        }}
      />

      {/* Hero Strip (Only on generator home, hidden during print) */}
      <div className="no-print bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/src/assets/images/bangladesh_education_seal_1792640564269.jpg"
              alt="NCTB Bangladesh Crest"
              className="w-12 h-12 object-contain rounded-full shadow-xs shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) কারিকুলাম
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  • নতুন শিক্ষাক্রম (ষষ্ঠ শ্রেণি)
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                ষষ্ঠ শ্রেণির স্বয়ংক্রিয় প্রশ্নপত্র প্রস্তুতকারক ও মূল্যায়ন সিস্টেম
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {activeTab === 'generator' && generatorView === 'paper' && (
              <button
                onClick={() => setGeneratorView('form')}
                className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>নতুন প্যারামিটারে তৈরি করুন</span>
              </button>
            )}
            {activeTab === 'generator' && generatorView === 'form' && currentPaper && (
              <button
                onClick={() => setGeneratorView('paper')}
                className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>পূর্ববর্তী প্রশ্নপত্র দেখুন</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'generator' && (
          <div>
            {generatorView === 'form' ? (
              <GeneratorForm
                onPaperGenerated={handlePaperGenerated}
                selectedSubjectId={selectedSubjectId}
                selectedChapterId={selectedChapterId}
              />
            ) : (
              <QuestionPaperView
                paper={currentPaper}
                onUpdatePaper={(updated) => {
                  setCurrentPaper(updated);
                  handleSavePaper(updated);
                }}
                onSavePaper={handleSavePaper}
                onRegenerateRequest={() => setGeneratorView('form')}
              />
            )}
          </div>
        )}

        {activeTab === 'curriculum' && (
          <CurriculumBrowser
            onSelectChapterForGenerator={handleSelectChapterForGenerator}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizMode paper={currentPaper} />
        )}

        {activeTab === 'saved' && (
          <SavedPapers
            savedPapers={savedPapers}
            onSelectPaper={handleSelectSavedPaper}
            onDeletePaper={handleDeletePaper}
            onNewPaperClick={() => {
              setActiveTab('generator');
              setGeneratorView('form');
            }}
          />
        )}
      </main>

      {/* Footer (Hidden during print) */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-700" />
            <span>
              এনসিটিবি ষষ্ঠ শ্রেণি প্রশ্নপত্র প্রণয়ন ইঞ্জিন — জাতীয় শিক্ষাক্রম রূপরেখা অনুযায়ী প্রস্তুতকৃত
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              কেন কাজ করছিল না? (স্থাপত্য বিবরণ)
            </button>
            <span>·</span>
            <span>প্রমিত বাংলা ইউনিকোড ও A4 প্রিন্ট উপযোগী</span>
          </div>
        </div>
      </footer>

      {/* Diagnostic & Help Modal */}
      <WhyPreviousFailedModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
