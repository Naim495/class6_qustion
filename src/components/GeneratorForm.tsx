import React, { useState } from 'react';
import { NCTB_SUBJECTS, PRELOADED_QUESTION_SETS } from '../data/nctbData.ts';
import { SubjectId, QuestionType, QuestionPaper } from '../types.ts';
import { toBengaliNumber } from '../utils/bengaliUtils.ts';
import { Sparkles, BookOpen, Sliders, School, AlertTriangle, FileText, Check } from 'lucide-react';

interface GeneratorFormProps {
  onPaperGenerated: (paper: QuestionPaper) => void;
  selectedSubjectId?: SubjectId;
  selectedChapterId?: string;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  onPaperGenerated,
  selectedSubjectId = 'science',
  selectedChapterId,
}) => {
  const [subjectId, setSubjectId] = useState<SubjectId>(selectedSubjectId);
  const currentSubject = NCTB_SUBJECTS.find((s) => s.id === subjectId) || NCTB_SUBJECTS[0];

  const [chapterId, setChapterId] = useState<string>(
    selectedChapterId || currentSubject.chapters[0]?.id || ''
  );
  const currentChapter = currentSubject.chapters.find((c) => c.id === chapterId) || currentSubject.chapters[0];

  // Custom text or textbook text
  const [useCustomText, setUseCustomText] = useState(false);
  const [customText, setCustomText] = useState('');

  // Question configuration
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['mcq', 'cq', 'short', 'blank']);
  const [countMcq, setCountMcq] = useState(5);
  const [countCq, setCountCq] = useState(1);
  const [countShort, setCountShort] = useState(2);
  const [countBlank, setCountBlank] = useState(2);
  const [difficulty, setDifficulty] = useState<'সহজ' | 'মধ্যম' | 'কঠিন' | 'মিশ্র'>('মধ্যম');

  // Exam header details
  const [schoolName, setSchoolName] = useState('সরকারি মডেল উচ্চ বিদ্যালয়');
  const [examTitle, setExamTitle] = useState('অর্ধ-বার্ষিক মূল্যায়ন পরীক্ষা ২০২৬');
  const [totalTime, setTotalTime] = useState('২ ঘণ্টা ৩০ মিনিট');

  // State for generation
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Switch subject handler
  const handleSubjectChange = (newSubjectId: SubjectId) => {
    setSubjectId(newSubjectId);
    const subj = NCTB_SUBJECTS.find((s) => s.id === newSubjectId);
    if (subj && subj.chapters.length > 0) {
      setChapterId(subj.chapters[0].id);
    }
  };

  const toggleQuestionType = (type: QuestionType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((t) => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage('ষষ্ঠ শ্রেণির এনসিটিবি পাঠ্যসূচি বিশ্লেষণ করা হচ্ছে...');

    const activeContent = useCustomText ? customText : (currentChapter?.content || '');

    if (!activeContent.trim()) {
      setErrorMessage('অনুগ্রহ করে পাঠ্যাংশ বা অধ্যায়ের বিষয়বস্তু প্রদান করুন।');
      setLoading(false);
      return;
    }

    try {
      setStatusMessage('Gemini 3.8 Flash এআই মডেল দ্বারা প্রমিত বাংলা প্রশ্ন প্রণয়ন করা হচ্ছে...');

      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject.name,
          subjectId: currentSubject.id,
          chapter: currentChapter ? `${currentChapter.banglaNumber} অধ্যায়: ${currentChapter.title}` : 'নির্বাচিত অধ্যায়',
          contentText: activeContent,
          questionTypes: selectedTypes,
          difficulty,
          countMcq: selectedTypes.includes('mcq') ? countMcq : 0,
          countCq: selectedTypes.includes('cq') ? countCq : 0,
          countShort: selectedTypes.includes('short') ? countShort : 0,
          countBlank: selectedTypes.includes('blank') ? countBlank : 0,
          schoolName,
          examTitle,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'প্রশ্নপত্র তৈরি করতে সমস্যা হয়েছে');
      }

      onPaperGenerated(result.data);
    } catch (err: any) {
      console.warn('API error, offering fallback pre-verified set:', err);
      setErrorMessage(
        `${err.message || 'সার্ভার রেসপন্স দিতে পারছে না'}। আপনি নিচে 'যাচাইকৃত নমুনা প্রশ্নপত্র লোড করুন' বাটনে ক্লিক করে তাৎক্ষণিক প্রশ্নপত্র দেখতে পারেন।`
      );
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  const handleLoadSample = () => {
    const sample = PRELOADED_QUESTION_SETS['science-sample'];
    if (sample) {
      onPaperGenerated(sample);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Intro banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              ষষ্ঠ শ্রেণি প্রশ্নপত্র প্রণয়ন স্টুডিও
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) ২০২৬ কারিকুলাম অনুযায়ী সৃজনশীল ও বহুনির্বাচনী প্রশ্নপত্র
            </p>
          </div>
          <button
            onClick={handleLoadSample}
            className="text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 self-start md:self-auto"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>নমুনা প্রশ্নপত্র লোড করুন</span>
          </button>
        </div>

        {/* Step 1: Subject Selection */}
        <div className="mt-5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            ১. বিষয় নির্বাচন করুন (Class 6 Subject)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {NCTB_SUBJECTS.map((s) => {
              const isSelected = s.id === subjectId;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSubjectChange(s.id)}
                  type="button"
                  className={`text-left p-3 rounded-lg border transition-all text-xs sm:text-sm font-medium ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 ring-1 ring-emerald-600 font-semibold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{s.englishName}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />}
                  </div>
                  <div className="text-xs text-slate-500 font-normal mt-0.5 truncate">
                    {s.name.split('(')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Chapter Selection & Content */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              ২. অধ্যায় ও বিষয়বস্তু (Chapter & Context)
            </label>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setUseCustomText(false)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  !useCustomText
                    ? 'bg-slate-900 text-white font-medium'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                এনসিটিবি পাঠ্যবই
              </button>
              <button
                type="button"
                onClick={() => setUseCustomText(true)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  useCustomText
                    ? 'bg-slate-900 text-white font-medium'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                কাস্টম পাঠ্যাংশ
              </button>
            </div>
          </div>

          {!useCustomText ? (
            <div className="space-y-3">
              <select
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {currentSubject.chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.banglaNumber} অধ্যায়: {ch.title}
                  </option>
                ))}
              </select>

              {currentChapter && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-700 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>অধ্যায়ের সারসংক্ষেপ:</span>
                  </div>
                  <p className="leading-relaxed text-slate-600 pl-5">
                    {currentChapter.summary}
                  </p>
                  <div className="pl-5 pt-1 border-t border-slate-200/60 text-slate-500">
                    <span className="font-medium text-slate-700">প্রধান শিখনফল: </span>
                    {currentChapter.learningOutcomes.join(' • ')}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="এখানে আপনার কাঙ্ক্ষিত অধ্যায় বা পরিচ্ছেদের বাংলা পাঠ্যাংশ অথবা পরীক্ষার জন্য কোনো বিশেষ অনুচ্ছেদ পেস্ট করুন..."
                rows={5}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
              <p className="text-[11px] text-slate-500">
                টিপস: আপনি পাঠ্যবই থেকে যেকোনো অনুচ্ছেদ কপি করে এখানে পেস্ট করতে পারেন। এআই স্বয়ংক্রিয়ভাবে সেখান থেকে উপযুক্ত প্রশ্ন তৈরি করবে।
              </p>
            </div>
          )}
        </div>

        {/* Step 3: Question Types & Quantities */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            ৩. প্রশ্নের ধরন ও সংখ্যা নির্ধারণ (Question Types)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* MCQ */}
            <div
              className={`p-3 rounded-lg border transition-all ${
                selectedTypes.includes('mcq')
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-200 bg-slate-50/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes('mcq')}
                    onChange={() => toggleQuestionType('mcq')}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>বহুনির্বাচনী (MCQ)</span>
                </label>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                <span>প্রশ্নের সংখ্যা:</span>
                <select
                  disabled={!selectedTypes.includes('mcq')}
                  value={countMcq}
                  onChange={(e) => setCountMcq(parseInt(e.target.value, 10))}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium"
                >
                  <option value={3}>৩ টি ({toBengaliNumber(3)})</option>
                  <option value={5}>৫ টি ({toBengaliNumber(5)})</option>
                  <option value={10}>১০ টি ({toBengaliNumber(10)})</option>
                  <option value={15}>১৫ টি ({toBengaliNumber(15)})</option>
                </select>
              </div>
            </div>

            {/* CQ */}
            <div
              className={`p-3 rounded-lg border transition-all ${
                selectedTypes.includes('cq')
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-200 bg-slate-50/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes('cq')}
                    onChange={() => toggleQuestionType('cq')}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>সৃজনশীল (CQ - ১০ নম্বর)</span>
                </label>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                <span>উদ্দীপক সংখ্যা:</span>
                <select
                  disabled={!selectedTypes.includes('cq')}
                  value={countCq}
                  onChange={(e) => setCountCq(parseInt(e.target.value, 10))}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium"
                >
                  <option value={1}>১ টি ({toBengaliNumber(1)})</option>
                  <option value={2}>২ টি ({toBengaliNumber(2)})</option>
                  <option value={3}>৩ টি ({toBengaliNumber(3)})</option>
                </select>
              </div>
            </div>

            {/* Short Answers */}
            <div
              className={`p-3 rounded-lg border transition-all ${
                selectedTypes.includes('short')
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-200 bg-slate-50/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes('short')}
                    onChange={() => toggleQuestionType('short')}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>সংক্ষিপ্ত প্রশ্ন (২ নম্বর)</span>
                </label>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                <span>প্রশ্নের সংখ্যা:</span>
                <select
                  disabled={!selectedTypes.includes('short')}
                  value={countShort}
                  onChange={(e) => setCountShort(parseInt(e.target.value, 10))}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium"
                >
                  <option value={2}>২ টি ({toBengaliNumber(2)})</option>
                  <option value={4}>৪ টি ({toBengaliNumber(4)})</option>
                  <option value={6}>৬ টি ({toBengaliNumber(6)})</option>
                </select>
              </div>
            </div>

            {/* Fill in Blanks */}
            <div
              className={`p-3 rounded-lg border transition-all ${
                selectedTypes.includes('blank')
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-200 bg-slate-50/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes('blank')}
                    onChange={() => toggleQuestionType('blank')}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>শূন্যস্থান পূরণ (১ নম্বর)</span>
                </label>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                <span>প্রশ্নের সংখ্যা:</span>
                <select
                  disabled={!selectedTypes.includes('blank')}
                  value={countBlank}
                  onChange={(e) => setCountBlank(parseInt(e.target.value, 10))}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium"
                >
                  <option value={2}>২ টি ({toBengaliNumber(2)})</option>
                  <option value={4}>৪ টি ({toBengaliNumber(4)})</option>
                  <option value={5}>৫ টি ({toBengaliNumber(5)})</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Exam Details & Difficulty */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              বিদ্যালয়ের নাম (School Name)
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              পরীক্ষার নাম (Exam Title)
            </label>
            <input
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              কাঠিন্যের মাত্রা (Difficulty)
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
              {(['সহজ', 'মধ্যম', 'কঠিন', 'মিশ্র'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`flex-1 py-1 text-xs rounded transition-colors ${
                    difficulty === lvl
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Generate CTA Button */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {loading ? (
              <span className="text-emerald-700 font-medium animate-pulse">
                {statusMessage}
              </span>
            ) : (
              <span>এনসিটিবি ফ্রেমওয়ার্ক অনুযায়ী শুদ্ধ প্রমিত বাংলায় প্রস্তুত হবে</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all shadow-sm flex items-center justify-center gap-2 ${
              loading
                ? 'bg-emerald-400 cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'প্রশ্নপত্র তৈরি হচ্ছে...' : 'প্রশ্নপত্র তৈরি করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
