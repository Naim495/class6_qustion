import React, { useState } from 'react';
import { QuestionPaper, McqQuestion } from '../types.ts';
import { toBengaliNumber, BANGLA_OPTION_LABELS } from '../utils/bengaliUtils.ts';
import { CheckCircle2, XCircle, Award, RotateCcw, HelpCircle, ChevronRight } from 'lucide-react';

interface QuizModeProps {
  paper: QuestionPaper;
}

export const QuizMode: React.FC<QuizModeProps> = ({ paper }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [revealedCqAnswers, setRevealedCqAnswers] = useState<Record<string, boolean>>({});

  const mcqs = paper.mcqs;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (selectedAnswers[questionId] !== undefined) return; // Prevent changing after answer
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setRevealedCqAnswers({});
  };

  // Calculate score
  let correctCount = 0;
  mcqs.forEach((m) => {
    if (selectedAnswers[m.id] === m.correctOptionIndex) {
      correctCount += 1;
    }
  });

  const totalAnswered = Object.keys(selectedAnswers).length;
  const isComplete = mcqs.length > 0 && totalAnswered === mcqs.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            শিক্ষার্থী অনুশীলন ও মক টেস্ট মোড
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            {paper.header.subjectName} — {paper.header.examTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            অধ্যায়: {paper.chapterTitles.join(', ')}
          </p>
        </div>

        {mcqs.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-500">স্কোর</div>
              <div className="text-lg font-bold text-emerald-700">
                {toBengaliNumber(correctCount)} / {toBengaliNumber(mcqs.length)}
              </div>
            </div>
            <button
              onClick={handleReset}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="পুনরায় পরীক্ষা দিন"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Completion Banner */}
      {isComplete && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-2">
          <Award className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-emerald-950">
            চমৎকার! আপনি সকল বহুনির্বাচনী প্রশ্নের উত্তর দিয়েছেন।
          </h3>
          <p className="text-xs text-emerald-800">
            আপনার প্রাপ্ত নম্বর: {toBengaliNumber(correctCount)} / {toBengaliNumber(mcqs.length)} ({toBengaliNumber(Math.round((correctCount / mcqs.length) * 100))}%)
          </p>
          <button
            onClick={handleReset}
            className="mt-2 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            আবার পরীক্ষা দিন
          </button>
        </div>
      )}

      {/* MCQs Section */}
      {mcqs.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
            বহুনির্বাচনী প্রশ্নাবলি ({toBengaliNumber(mcqs.length)} টি)
          </h3>

          {mcqs.map((mcq, idx) => {
            const userAnswer = selectedAnswers[mcq.id];
            const hasAnswered = userAnswer !== undefined;
            const isCorrect = hasAnswered && userAnswer === mcq.correctOptionIndex;

            return (
              <div
                key={mcq.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 leading-relaxed">
                    <span className="font-bold text-slate-700">{toBengaliNumber(idx + 1)}. </span>
                    {mcq.question}
                  </h4>
                  {hasAnswered && (
                    <div className="shrink-0">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      )}
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  {mcq.options.map((opt, oIdx) => {
                    const isSelected = userAnswer === oIdx;
                    const isAnswerTarget = hasAnswered && oIdx === mcq.correctOptionIndex;

                    let btnClass = 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50';
                    if (hasAnswered) {
                      if (isAnswerTarget) {
                        btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                      } else if (isSelected) {
                        btnClass = 'border-rose-400 bg-rose-50 text-rose-950 font-semibold';
                      } else {
                        btnClass = 'border-slate-200 bg-slate-50 text-slate-400';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={hasAnswered}
                        onClick={() => handleSelectOption(mcq.id, oIdx)}
                        className={`text-left p-2.5 rounded-lg border transition-all flex items-start gap-2 ${btnClass}`}
                      >
                        <span className="font-semibold text-slate-600 shrink-0">
                          {BANGLA_OPTION_LABELS[oIdx]}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {hasAnswered && (
                  <div
                    className={`p-3 rounded-lg text-xs leading-relaxed ${
                      isCorrect ? 'bg-emerald-50/70 border border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border border-rose-200 text-rose-900'
                    }`}
                  >
                    <div>
                      <strong>সঠিক উত্তর: </strong>
                      {BANGLA_OPTION_LABELS[mcq.correctOptionIndex]} {mcq.options[mcq.correctOptionIndex]}
                    </div>
                    {mcq.explanation && (
                      <div className="mt-1 text-slate-600">
                        <strong>ব্যাখ্যা: </strong>
                        {mcq.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
          এই প্রশ্নপত্রে কোনো বহুনির্বাচনী (MCQ) প্রশ্ন পাওয়া যায়নি। প্রশ্ন প্রস্তুতকারকে গিয়ে MCQ অন্তর্ভুক্ত করে নতুন প্রশ্ন তৈরি করুন।
        </div>
      )}

      {/* CQ Self-Assessment Section */}
      {paper.cqs.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
            সৃজনশীল প্রশ্ন স্ব-মূল্যায়ন ({toBengaliNumber(paper.cqs.length)} টি)
          </h3>

          {paper.cqs.map((cq, idx) => (
            <div key={cq.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="text-xs font-bold text-slate-600 uppercase">
                সৃজনশীল প্রশ্ন নং {toBengaliNumber(idx + 1)}
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs sm:text-sm text-slate-800 italic font-bangla-serif">
                <strong>উদ্দীপক: </strong> {cq.stimulus}
              </div>

              <div className="space-y-2">
                {cq.subQuestions.map((sq) => {
                  const key = `${cq.id}-${sq.part}`;
                  const isRevealed = revealedCqAnswers[key];

                  return (
                    <div key={sq.part} className="border border-slate-100 rounded-lg p-3 text-xs sm:text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-slate-900">
                          <span className="font-bold">({sq.part}) </span> {sq.question}
                        </p>
                        <span className="text-xs text-slate-500 font-semibold shrink-0">
                          [{toBengaliNumber(sq.marks)} নম্বর]
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          ধরন: {sq.typeLabel}
                        </span>
                        <button
                          onClick={() =>
                            setRevealedCqAnswers((prev) => ({
                              ...prev,
                              [key]: !prev[key],
                            }))
                          }
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                        >
                          {isRevealed ? 'নমুনা উত্তর লুকান' : 'নমুনা উত্তর দেখুন'}
                        </button>
                      </div>

                      {isRevealed && sq.sampleAnswer && (
                        <div className="mt-2 p-2.5 bg-emerald-50/60 border border-emerald-200 rounded text-xs text-emerald-950 leading-relaxed">
                          <strong>আদর্শ উত্তর: </strong>
                          {sq.sampleAnswer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
