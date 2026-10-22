import React from 'react';
import { QuestionPaper } from '../types.ts';
import { toBengaliNumber } from '../utils/bengaliUtils.ts';
import { FileText, Trash2, ArrowRight, BookOpen, Clock } from 'lucide-react';

interface SavedPapersProps {
  savedPapers: QuestionPaper[];
  onSelectPaper: (paper: QuestionPaper) => void;
  onDeletePaper: (id: string) => void;
  onNewPaperClick: () => void;
}

export const SavedPapers: React.FC<SavedPapersProps> = ({
  savedPapers,
  onSelectPaper,
  onDeletePaper,
  onNewPaperClick,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            সংরক্ষিত প্রশ্নপত্রসমূহ (Saved Papers)
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            আপনার প্রস্তুতকৃত প্রশ্নপত্রসমূহ যা ব্রাউজারে সংরক্ষিত আছে
          </p>
        </div>

        <button
          onClick={onNewPaperClick}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors self-start sm:self-auto"
        >
          নতুন প্রশ্নপত্র তৈরি করুন
        </button>
      </div>

      {savedPapers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {savedPapers.map((paper) => {
            const mcqCount = paper.mcqs.length;
            const cqCount = paper.cqs.length;
            const shortCount = paper.shorts.length;
            const blankCount = paper.blanks.length;
            const totalQuestions = mcqCount + cqCount + shortCount + blankCount;

            return (
              <div
                key={paper.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {paper.header.className}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {paper.header.schoolName} — {paper.header.examTitle}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    বিষয়: {paper.header.subjectName} | অধ্যায়: {paper.chapterTitles.join(', ')}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <span>মোট প্রশ্ন: {toBengaliNumber(totalQuestions)} টি</span>
                    <span>·</span>
                    <span>পূর্ণমান: {toBengaliNumber(paper.header.totalMarks)}</span>
                    <span>·</span>
                    <span>সময়: {paper.header.totalTime}</span>
                    <span>·</span>
                    <span>কাঠিন্য: {paper.difficulty}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onDeletePaper(paper.id)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectPaper(paper)}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>প্রশ্নপত্র খুলুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">
            বর্তমানে কোনো সংরক্ষিত প্রশ্নপত্র নেই
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            প্রশ্ন প্রস্তুতকারক থেকে প্রশ্ন তৈরি করে 'সংরক্ষণ' বাটনে ক্লিক করলে তা এখানে স্থায়ীভাবে জমা থাকবে।
          </p>
          <button
            onClick={onNewPaperClick}
            className="mt-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition-colors"
          >
            প্রথম প্রশ্নপত্র তৈরি করুন
          </button>
        </div>
      )}
    </div>
  );
};
