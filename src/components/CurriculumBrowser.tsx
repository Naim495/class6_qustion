import React, { useState } from 'react';
import { NCTB_SUBJECTS } from '../data/nctbData.ts';
import { SubjectId, Chapter } from '../types.ts';
import { BookOpen, CheckCircle, ArrowRight, Search, FileQuestion } from 'lucide-react';

interface CurriculumBrowserProps {
  onSelectChapterForGenerator: (subjectId: SubjectId, chapterId: string) => void;
}

export const CurriculumBrowser: React.FC<CurriculumBrowserProps> = ({
  onSelectChapterForGenerator,
}) => {
  const [activeSubjectId, setActiveSubjectId] = useState<SubjectId>('science');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);

  const activeSubject = NCTB_SUBJECTS.find((s) => s.id === activeSubjectId) || NCTB_SUBJECTS[0];

  // Filter chapters if search query exists
  const filteredChapters = activeSubject.chapters.filter((ch) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      ch.title.toLowerCase().includes(q) ||
      ch.summary.toLowerCase().includes(q) ||
      ch.content.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              ষষ্ঠ শ্রেণি জাতীয় শিক্ষাক্রম (NCTB Curriculum)
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              ২০২৬ শিক্ষাবর্ষের সকল বিষয়ের অধ্যায়ভিত্তিক শিখনফল, পাঠ্যাংশ ও প্রশ্ন প্রণয়ন গাইড
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="অধ্যায় বা বিষয়বস্তু খুঁজুন..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Subject Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 mt-4 border-t border-slate-100 scrollbar-none pb-1">
          {NCTB_SUBJECTS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSubjectId(s.id);
                setExpandedChapterId(null);
              }}
              className={`px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                activeSubjectId === s.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{s.englishName}</span>
              <span className="text-[11px] font-normal opacity-80">({s.name.split('(')[0]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chapters list */}
      <div className="grid grid-cols-1 gap-4">
        {filteredChapters.map((chapter) => {
          const isExpanded = expandedChapterId === chapter.id;
          return (
            <div
              key={chapter.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs transition-shadow hover:shadow-md"
            >
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {chapter.banglaNumber} অধ্যায়
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {chapter.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {chapter.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {isExpanded ? 'সংক্ষেপ করুন' : 'বিস্তারিত দেখুন'}
                  </button>
                  <button
                    onClick={() => onSelectChapterForGenerator(activeSubject.id, chapter.id)}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <FileQuestion className="w-3.5 h-3.5" />
                    <span>প্রশ্ন বানান</span>
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="bg-slate-50/70 border-t border-slate-200 p-5 space-y-4 text-xs sm:text-sm">
                  {/* Learning outcomes */}
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>এনসিটিবি নির্ধারিত প্রধান শিখনফল (Learning Outcomes):</span>
                    </h4>
                    <ul className="space-y-1.5 pl-6 list-disc text-slate-700">
                      {chapter.learningOutcomes.map((lo, idx) => (
                        <li key={idx}>{lo}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Textbook content preview */}
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>মূল পাঠ্যাংশ ও বিষয়বস্তু (Textbook Excerpt):</span>
                    </h4>
                    <div className="bg-white border border-slate-200 rounded-lg p-4 font-bangla-serif text-slate-800 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-line text-xs sm:text-sm">
                      {chapter.content}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onSelectChapterForGenerator(activeSubject.id, chapter.id)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <span>এই অধ্যায়ের পাঠ্যাংশ নিয়ে প্রশ্নপত্র প্রস্তুত করুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredChapters.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            কোনো অধ্যায় খুঁজে পাওয়া যায়নি। অনুসন্ধান ফিল্টার পরিবর্তন করুন।
          </div>
        )}
      </div>
    </div>
  );
};
