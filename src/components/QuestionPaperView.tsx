import React, { useState } from 'react';
import { QuestionPaper, McqQuestion, CqQuestion, ShortQuestion, BlankQuestion } from '../types.ts';
import {
  toBengaliNumber,
  BANGLA_OPTION_LABELS,
  downloadAsWordDoc,
  downloadAsHtmlFile,
  downloadAsTextFile,
} from '../utils/bengaliUtils.ts';
import {
  Printer,
  FileDown,
  Copy,
  Eye,
  EyeOff,
  Edit3,
  Check,
  Trash2,
  BookmarkCheck,
  RefreshCw,
  Plus,
  HelpCircle,
  Download,
  FileCode,
  FileText,
  AlertCircle
} from 'lucide-react';

interface QuestionPaperViewProps {
  paper: QuestionPaper;
  onUpdatePaper: (updated: QuestionPaper) => void;
  onSavePaper: (paper: QuestionPaper) => void;
  onRegenerateRequest: () => void;
}

export const QuestionPaperView: React.FC<QuestionPaperViewProps> = ({
  paper,
  onUpdatePaper,
  onSavePaper,
  onRegenerateRequest,
}) => {
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Calculate total marks
  const totalMcqMarks = paper.mcqs.reduce((sum, q) => sum + (q.marks || 1), 0);
  const totalCqMarks = paper.cqs.reduce((sum, q) => sum + (q.marks || 10), 0);
  const totalShortMarks = paper.shorts.reduce((sum, q) => sum + (q.marks || 2), 0);
  const totalBlankMarks = paper.blanks.reduce((sum, q) => sum + (q.marks || 1), 0);
  const calculatedTotalMarks = totalMcqMarks + totalCqMarks + totalShortMarks + totalBlankMarks;


  const handleCopyText = () => {
    let text = `${paper.header.schoolName}\n${paper.header.examTitle} (${paper.header.academicYear})\nশ্রেণি: ${paper.header.className} | বিষয়: ${paper.header.subjectName}\nসময়: ${paper.header.totalTime} | পূর্ণমান: ${toBengaliNumber(calculatedTotalMarks)}\n\n`;

    if (paper.mcqs.length > 0) {
      text += `ক-বিভাগ: বহুনির্বাচনী প্রশ্ন\n`;
      paper.mcqs.forEach((m, idx) => {
        text += `${toBengaliNumber(idx + 1)}. ${m.question} [মান: ${toBengaliNumber(m.marks)}]\n`;
        m.options.forEach((opt, oIdx) => {
          text += `  ${BANGLA_OPTION_LABELS[oIdx]} ${opt}\n`;
        });
      });
      text += `\n`;
    }

    if (paper.cqs.length > 0) {
      text += `খ-বিভাগ: সৃজনশীল প্রশ্ন\n`;
      paper.cqs.forEach((cq, idx) => {
        text += `${toBengaliNumber(idx + 1)}. উদ্দীপক:\n${cq.stimulus}\n`;
        cq.subQuestions.forEach((sq) => {
          text += `  (${sq.part}) ${sq.question} (${toBengaliNumber(sq.marks)})\n`;
        });
      });
      text += `\n`;
    }

    if (paper.shorts.length > 0) {
      text += `গ-বিভাগ: সংক্ষিপ্ত প্রশ্ন\n`;
      paper.shorts.forEach((s, idx) => {
        text += `${toBengaliNumber(idx + 1)}. ${s.question} [মান: ${toBengaliNumber(s.marks)}]\n`;
      });
      text += `\n`;
    }

    if (paper.blanks.length > 0) {
      text += `ঘ-বিভাগ: শূন্যস্থান পূরণ\n`;
      paper.blanks.forEach((b, idx) => {
        text += `${toBengaliNumber(idx + 1)}. ${b.sentenceWithBlank} [মান: ${toBengaliNumber(b.marks)}]\n`;
      });
      text += `\n`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buildPaperHtmlString = () => {
    let htmlContent = `
      <div class="exam-header">
        <h1>${paper.header.schoolName}</h1>
        <h2>${paper.header.examTitle} (${paper.header.academicYear})</h2>
        <table class="meta-table">
          <tr>
            <td align="left">শ্রেণি: ${paper.header.className}</td>
            <td align="center">বিষয়: ${paper.header.subjectName}</td>
            <td align="right">পূর্ণমান: ${toBengaliNumber(calculatedTotalMarks)}</td>
          </tr>
          <tr>
            <td align="left">অধ্যায়: ${paper.chapterTitles.join(', ')}</td>
            <td align="center">সময়: ${paper.header.totalTime}</td>
            <td align="right">রোল: .................</td>
          </tr>
        </table>
        <p style="margin-top: 8px; font-style: italic; border-top: 1px dotted #ccc; padding-top: 4px;">
          ${paper.header.instructions}
        </p>
      </div>
    `;

    if (paper.mcqs.length > 0) {
      htmlContent += `<div class="section-title">ক-বিভাগ: বহুনির্বাচনী প্রশ্ন (মান: ${toBengaliNumber(totalMcqMarks)})</div>`;
      paper.mcqs.forEach((m, idx) => {
        htmlContent += `
          <div class="q-item">
            <p><strong>${toBengaliNumber(idx + 1)}.</strong> ${m.question} <span class="marks">[${toBengaliNumber(m.marks)}]</span></p>
            <div class="options-grid">
              ${m.options.map((opt, oIdx) => `<div>${BANGLA_OPTION_LABELS[oIdx]} ${opt}</div>`).join('')}
            </div>
          </div>
        `;
      });
    }

    if (paper.cqs.length > 0) {
      htmlContent += `<div class="section-title">খ-বিভাগ: সৃজনশীল প্রশ্ন (মান: ${toBengaliNumber(totalCqMarks)})</div>`;
      paper.cqs.forEach((cq, idx) => {
        htmlContent += `
          <div class="q-item">
            <p><strong>${toBengaliNumber(idx + 1)}. উদ্দীপকটি পড়ে সংশ্লিষ্ট প্রশ্নগুলোর উত্তর দাও:</strong></p>
            <div class="stimulus">${cq.stimulus}</div>
            <ol type="a" style="list-style-type: none; padding-left: 10px;">
              ${cq.subQuestions
                .map(
                  (sq) =>
                    `<li style="margin-bottom: 4px;">(${sq.part}) ${sq.question} <span class="marks">${toBengaliNumber(sq.marks)}</span></li>`
                )
                .join('')}
            </ol>
          </div>
        `;
      });
    }

    if (paper.shorts.length > 0) {
      htmlContent += `<div class="section-title">গ-বিভাগ: সংক্ষিপ্ত প্রশ্ন (মান: ${toBengaliNumber(totalShortMarks)})</div>`;
      paper.shorts.forEach((s, idx) => {
        htmlContent += `
          <div class="q-item">
            <p><strong>${toBengaliNumber(idx + 1)}.</strong> ${s.question} <span class="marks">[${toBengaliNumber(s.marks)}]</span></p>
          </div>
        `;
      });
    }

    if (paper.blanks.length > 0) {
      htmlContent += `<div class="section-title">ঘ-বিভাগ: শূন্যস্থান পূরণ (মান: ${toBengaliNumber(totalBlankMarks)})</div>`;
      paper.blanks.forEach((b, idx) => {
        htmlContent += `
          <div class="q-item">
            <p><strong>${toBengaliNumber(idx + 1)}.</strong> ${b.sentenceWithBlank} <span class="marks">[${toBengaliNumber(b.marks)}]</span></p>
          </div>
        `;
      });
    }

    // Answer sheet
    htmlContent += `
      <div class="page-break" style="page-break-before: always; margin-top: 30px; padding-top: 20px; border-top: 2px dashed #666;"></div>
      <div class="exam-header">
        <h2>উত্তরমালা ও সমাধান নির্দেশিকা</h2>
        <p><strong>${paper.header.subjectName} | ${paper.header.className}</strong></p>
      </div>
    `;

    if (paper.mcqs.length > 0) {
      htmlContent += `<h3>বহুনির্বাচনী প্রশ্নের সঠিক উত্তর:</h3><ul>`;
      paper.mcqs.forEach((m, idx) => {
        htmlContent += `<li><strong>${toBengaliNumber(idx + 1)}.</strong> ${BANGLA_OPTION_LABELS[m.correctOptionIndex]} ${m.options[m.correctOptionIndex]} ${m.explanation ? `(ব্যাখ্যা: ${m.explanation})` : ''}</li>`;
      });
      htmlContent += `</ul>`;
    }

    if (paper.cqs.length > 0) {
      htmlContent += `<h3>সৃজনশীল প্রশ্নের উত্তর নির্দেশিকা:</h3>`;
      paper.cqs.forEach((cq, idx) => {
        htmlContent += `<div style="margin-bottom: 10px;"><strong>প্রশ্ন ${toBengaliNumber(idx + 1)}:</strong>`;
        cq.subQuestions.forEach((sq) => {
          htmlContent += `<div>(${sq.part}) ${sq.typeLabel}: ${sq.sampleAnswer || 'পাঠ্যবই অনুযায়ী বিশ্লেষণ'}</div>`;
        });
        htmlContent += `</div>`;
      });
    }

    return htmlContent;
  };

  const handleExportWord = async () => {
    const filename = `${paper.header.subjectName}_ষষ্ঠ_শ্রেণি_প্রশ্নপত্র`;
    const html = buildPaperHtmlString();
    setDownloadSuccessMessage('Word ফাইল (.doc) ডাউনলোড শুরু হয়েছে...');
    await downloadAsWordDoc(filename, html);
    setTimeout(() => setDownloadSuccessMessage(null), 4000);
  };

  const handleExportHtml = async () => {
    const filename = `${paper.header.subjectName}_ষষ্ঠ_শ্রেণি_প্রিন্ট_রেডি_প্রশ্নপত্র`;
    const html = buildPaperHtmlString();
    setDownloadSuccessMessage('প্রিন্ট-রেডি HTML ফাইল ডাউনলোড শুরু হয়েছে...');
    await downloadAsHtmlFile(filename, html);
    setTimeout(() => setDownloadSuccessMessage(null), 4000);
  };

  const handleExportText = async () => {
    const filename = `${paper.header.subjectName}_ষষ্ঠ_শ্রেণি_প্রশ্নপত্র`;
    let text = `${paper.header.schoolName}\n${paper.header.examTitle} (${paper.header.academicYear})\nশ্রেণি: ${paper.header.className} | বিষয়: ${paper.header.subjectName}\nসময়: ${paper.header.totalTime} | পূর্ণমান: ${toBengaliNumber(calculatedTotalMarks)}\n\n`;

    if (paper.mcqs.length > 0) {
      text += `ক-বিভাগ: বহুনির্বাচনী প্রশ্ন\n`;
      paper.mcqs.forEach((m, idx) => {
        text += `${toBengaliNumber(idx + 1)}. ${m.question} [মান: ${toBengaliNumber(m.marks)}]\n`;
        m.options.forEach((opt, oIdx) => {
          text += `  ${BANGLA_OPTION_LABELS[oIdx]} ${opt}\n`;
        });
      });
      text += `\n`;
    }

    if (paper.cqs.length > 0) {
      text += `খ-বিভাগ: সৃজনশীল প্রশ্ন\n`;
      paper.cqs.forEach((cq, idx) => {
        text += `${toBengaliNumber(idx + 1)}. উদ্দীপক:\n${cq.stimulus}\n`;
        cq.subQuestions.forEach((sq) => {
          text += `  (${sq.part}) ${sq.question} (${toBengaliNumber(sq.marks)})\n`;
        });
      });
      text += `\n`;
    }

    if (paper.shorts.length > 0) {
      text += `গ-বিভাগ: সংক্ষিপ্ত প্রশ্ন\n`;
      paper.shorts.forEach((s, idx) => {
        text += `${toBengaliNumber(idx + 1)}. ${s.question} [মান: ${toBengaliNumber(s.marks)}]\n`;
      });
      text += `\n`;
    }

    if (paper.blanks.length > 0) {
      text += `ঘ-বিভাগ: শূন্যস্থান পূরণ\n`;
      paper.blanks.forEach((b, idx) => {
        text += `${toBengaliNumber(idx + 1)}. ${b.sentenceWithBlank} [মান: ${toBengaliNumber(b.marks)}]\n`;
      });
      text += `\n`;
    }

    setDownloadSuccessMessage('টেক্সট ফাইল (.txt) ডাউনলোড শুরু হয়েছে...');
    await downloadAsTextFile(filename, text);
    setTimeout(() => setDownloadSuccessMessage(null), 4000);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Direct print blocked by sandbox, showing download modal:', e);
      setShowDownloadModal(true);
    }
  };

  const handleSave = () => {
    onSavePaper(paper);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Editing handlers
  const handleUpdateHeader = (field: keyof typeof paper.header, val: any) => {
    onUpdatePaper({
      ...paper,
      header: {
        ...paper.header,
        [field]: val,
      },
    });
  };

  const handleDeleteMcq = (id: string) => {
    onUpdatePaper({
      ...paper,
      mcqs: paper.mcqs.filter((m) => m.id !== id),
    });
  };

  const handleDeleteCq = (id: string) => {
    onUpdatePaper({
      ...paper,
      cqs: paper.cqs.filter((c) => c.id !== id),
    });
  };

  const handleDeleteShort = (id: string) => {
    onUpdatePaper({
      ...paper,
      shorts: paper.shorts.filter((s) => s.id !== id),
    });
  };

  const handleDeleteBlank = (id: string) => {
    onUpdatePaper({
      ...paper,
      blanks: paper.blanks.filter((b) => b.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Control Actions Bar (Hidden during print) */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              isEditing
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'সম্পাদনা সম্পন্ন' : 'প্রশ্নপত্র সম্পাদনা'}</span>
          </button>

          <button
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              showAnswerKey
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {showAnswerKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showAnswerKey ? 'উত্তরমালা লুকান' : 'উত্তরমালা ও ব্যাখ্যা'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyText}
            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="টেক্সট কপি"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
          </button>

          <button
            onClick={handleExportWord}
            className="px-2.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Word ফাইল ডাউনলোড (.doc)"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600" />
            <span>Word (.doc)</span>
          </button>

          <button
            onClick={handleExportHtml}
            className="px-2.5 py-1.5 bg-purple-50 border border-purple-200 text-purple-800 hover:bg-purple-100 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="অফলাইন প্রিন্ট-রেডি HTML ডাউনলোড (যেকোনো ব্রাউজারে ডাবল ক্লিক করে A4 PDF সেভ করুন)"
          >
            <FileCode className="w-3.5 h-3.5 text-purple-600" />
            <span>অফলাইন HTML</span>
          </button>

          <button
            onClick={() => setShowDownloadModal(true)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="ডাউনলোডের সকল অপশন দেখুন"
          >
            <Download className="w-3.5 h-3.5" />
            <span>সকল অপশন</span>
          </button>

          <button
            onClick={handleSave}
            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {saved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <BookmarkCheck className="w-3.5 h-3.5" />}
            <span>{saved ? 'সংরক্ষিত' : 'সংরক্ষণ'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট / PDF</span>
          </button>
        </div>
      </div>

      {/* Download feedback toast */}
      {downloadSuccessMessage && (
        <div className="no-print bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between shadow-xs transition-all">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccessMessage} (যদি ডাউনলোডে সমস্যা হয়, 'অফলাইন HTML' অপশনটি ট্রাই করুন)</span>
          </div>
          <button
            onClick={() => setShowDownloadModal(true)}
            className="underline font-semibold hover:text-emerald-950 ml-2"
          >
            সহায়তা
          </button>
        </div>
      )}

      {/* Actual Question Paper Sheet (Print-styled A4) */}
      <div className="print-paper bg-white border border-slate-200 shadow-md rounded-xl max-w-4xl mx-auto p-8 sm:p-12 text-slate-900 leading-relaxed font-sans">
        {/* Header Block */}
        <div className="text-center border-b-2 border-slate-800 pb-5 mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img
              src="/src/assets/images/bangladesh_education_seal_1792640564269.jpg"
              alt="Education Seal"
              className="w-12 h-12 object-contain"
              referrerPolicy="no-referrer"
            />
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={paper.header.schoolName}
                  onChange={(e) => handleUpdateHeader('schoolName', e.target.value)}
                  className="text-center font-bold text-xl sm:text-2xl text-slate-900 border-b border-dashed border-slate-400 focus:outline-none w-full"
                />
              ) : (
                <h1 className="font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                  {paper.header.schoolName}
                </h1>
              )}
              {isEditing ? (
                <input
                  type="text"
                  value={paper.header.examTitle}
                  onChange={(e) => handleUpdateHeader('examTitle', e.target.value)}
                  className="text-center text-sm font-semibold text-slate-700 border-b border-dashed border-slate-400 focus:outline-none w-full mt-1"
                />
              ) : (
                <h2 className="text-sm sm:text-base font-semibold text-slate-700 mt-0.5">
                  {paper.header.examTitle} ({paper.header.academicYear})
                </h2>
              )}
            </div>
          </div>

          {/* Exam metadata table */}
          <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm font-medium pt-3 border-t border-slate-200 mt-3 text-slate-800">
            <div className="text-left">
              <span>শ্রেণি: </span>
              <span className="font-bold">{paper.header.className}</span>
            </div>
            <div className="text-center">
              <span>বিষয়: </span>
              <span className="font-bold">{paper.header.subjectName}</span>
            </div>
            <div className="text-right">
              <span>পূর্ণমান: </span>
              <span className="font-bold">{toBengaliNumber(calculatedTotalMarks)}</span>
            </div>
            <div className="text-left text-xs text-slate-600 truncate">
              <span>অধ্যায়: {paper.chapterTitles.join(', ')}</span>
            </div>
            <div className="text-center">
              <span>সময়: </span>
              <span className="font-bold">{paper.header.totalTime}</span>
            </div>
            <div className="text-right text-xs text-slate-600">
              <span>কাঠিন্য: {paper.difficulty}</span>
            </div>
          </div>

          {/* Student Fill-in Info Line */}
          <div className="grid grid-cols-3 gap-2 text-xs text-slate-700 pt-3 border-t border-dotted border-slate-300 mt-3">
            <div className="text-left">শিক্ষার্থীর নাম: .......................................</div>
            <div className="text-center">রোল নম্বর: ..................</div>
            <div className="text-right">শাখা: ....................</div>
          </div>

          {/* Instruction notice */}
          <div className="text-xs text-slate-600 italic text-center mt-3 pt-2 border-t border-slate-100">
            {paper.header.instructions}
          </div>
        </div>

        {/* Section A: MCQ */}
        {paper.mcqs.length > 0 && (
          <div className="mb-8 print-avoid-break">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-4">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                ক-বিভাগ: বহুনির্বাচনী প্রশ্ন (সকল প্রশ্নের উত্তর দাও)
              </h3>
              <span className="text-xs sm:text-sm font-bold text-slate-700">
                মান: {toBengaliNumber(totalMcqMarks)}
              </span>
            </div>

            <div className="space-y-4">
              {paper.mcqs.map((mcq, idx) => (
                <div key={mcq.id} className="relative group">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed">
                      <span className="font-bold">{toBengaliNumber(idx + 1)}. </span>
                      {mcq.question}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-slate-600">
                        [{toBengaliNumber(mcq.marks)}]
                      </span>
                      {isEditing && (
                        <button
                          onClick={() => handleDeleteMcq(mcq.id)}
                          className="no-print text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4 options in 2x2 grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 pl-4 text-xs sm:text-sm text-slate-800">
                    {mcq.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`flex items-start gap-1.5 ${
                          showAnswerKey && mcq.correctOptionIndex === oIdx
                            ? 'text-emerald-700 font-bold bg-emerald-50/80 px-1.5 py-0.5 rounded'
                            : ''
                        }`}
                      >
                        <span className="font-semibold text-slate-600 shrink-0">
                          {BANGLA_OPTION_LABELS[oIdx]}
                        </span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>

                  {/* Inline answer and explanation if revealed */}
                  {showAnswerKey && (
                    <div className="mt-2 pl-4 text-xs text-emerald-800 bg-emerald-50/60 p-2 rounded border border-emerald-200/80 space-y-0.5 no-print">
                      <div>
                        <strong>সঠিক উত্তর: </strong>
                        {BANGLA_OPTION_LABELS[mcq.correctOptionIndex]} {mcq.options[mcq.correctOptionIndex]}
                      </div>
                      {mcq.explanation && (
                        <div className="text-slate-600">
                          <strong>ব্যাখ্যা: </strong>
                          {mcq.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section B: Creative Questions (CQ) */}
        {paper.cqs.length > 0 && (
          <div className="mb-8 print-avoid-break">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-4">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                খ-বিভাগ: সৃজনশীল প্রশ্ন (উদ্দীপক পড়ে সংশ্লিষ্ট প্রশ্নের উত্তর দাও)
              </h3>
              <span className="text-xs sm:text-sm font-bold text-slate-700">
                মান: {toBengaliNumber(totalCqMarks)}
              </span>
            </div>

            <div className="space-y-6">
              {paper.cqs.map((cq, idx) => (
                <div key={cq.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/40">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      প্রশ্ন নং {toBengaliNumber(idx + 1)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">
                        পূর্ণমান: {toBengaliNumber(cq.marks)}
                      </span>
                      {isEditing && (
                        <button
                          onClick={() => handleDeleteCq(cq.id)}
                          className="no-print text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stimulus */}
                  <div className="p-3 bg-white rounded border border-slate-300 text-xs sm:text-sm text-slate-800 leading-relaxed font-bangla-serif mb-3 italic">
                    <span className="font-bold not-italic text-slate-900">উদ্দীপক: </span>
                    {cq.stimulus}
                  </div>

                  {/* 4 parts: (ক), (খ), (গ), (ঘ) */}
                  <div className="space-y-2 pl-2">
                    {cq.subQuestions.map((sq) => (
                      <div key={sq.part} className="text-xs sm:text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-slate-900 leading-relaxed">
                            <span className="font-bold">({sq.part}) </span>
                            {sq.question}
                          </p>
                          <span className="font-semibold text-slate-700 shrink-0 ml-2">
                            {toBengaliNumber(sq.marks)}
                          </span>
                        </div>

                        {showAnswerKey && sq.sampleAnswer && (
                          <div className="mt-1 pl-4 text-xs text-slate-600 bg-white p-2 rounded border border-slate-200 no-print">
                            <strong className="text-emerald-800">নমুনা উত্তর ({sq.typeLabel}): </strong>
                            {sq.sampleAnswer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section C: Short Answer Questions */}
        {paper.shorts.length > 0 && (
          <div className="mb-8 print-avoid-break">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-4">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                গ-বিভাগ: সংক্ষিপ্ত উত্তর প্রশ্ন
              </h3>
              <span className="text-xs sm:text-sm font-bold text-slate-700">
                মান: {toBengaliNumber(totalShortMarks)}
              </span>
            </div>

            <div className="space-y-3">
              {paper.shorts.map((s, idx) => (
                <div key={s.id} className="text-xs sm:text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-slate-900 font-medium">
                      <span className="font-bold">{toBengaliNumber(idx + 1)}. </span>
                      {s.question}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-slate-600">
                        [{toBengaliNumber(s.marks)}]
                      </span>
                      {isEditing && (
                        <button
                          onClick={() => handleDeleteShort(s.id)}
                          className="no-print text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {showAnswerKey && s.sampleAnswer && (
                    <div className="mt-1 pl-4 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 no-print">
                      <strong className="text-emerald-800">নমুনা উত্তর: </strong>
                      {s.sampleAnswer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section D: Fill in the Blanks */}
        {paper.blanks.length > 0 && (
          <div className="mb-8 print-avoid-break">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-4">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                ঘ-বিভাগ: শূন্যস্থান পূরণ করো
              </h3>
              <span className="text-xs sm:text-sm font-bold text-slate-700">
                মান: {toBengaliNumber(totalBlankMarks)}
              </span>
            </div>

            <div className="space-y-3">
              {paper.blanks.map((b, idx) => (
                <div key={b.id} className="text-xs sm:text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-slate-900 font-medium">
                      <span className="font-bold">{toBengaliNumber(idx + 1)}. </span>
                      {b.sentenceWithBlank}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-slate-600">
                        [{toBengaliNumber(b.marks)}]
                      </span>
                      {isEditing && (
                        <button
                          onClick={() => handleDeleteBlank(b.id)}
                          className="no-print text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {showAnswerKey && b.blankAnswer && (
                    <div className="mt-1 pl-4 text-xs text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200 no-print">
                      <strong className="text-emerald-800">সঠিক শব্দ: </strong>
                      <span className="font-semibold text-emerald-900">{b.blankAnswer}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer for examination paper */}
        <div className="border-t border-slate-300 pt-4 mt-8 flex items-center justify-between text-xs text-slate-500">
          <span>{paper.header.schoolName} — NCTB ষষ্ঠ শ্রেণি পাঠ্যক্রম</span>
          <span>সমাপ্ত</span>
        </div>

        {/* Printable Answer Key Sheet (Only visible if showAnswerKey is on) */}
        {showAnswerKey && (
          <div className="print-page-break print-paper pt-10 border-t-2 border-slate-900 mt-12">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                {paper.header.schoolName}
              </h2>
              <h3 className="text-base font-semibold text-slate-800">
                উত্তরমালা ও মূল্যায়ন নির্দেশিকা (Answer Key)
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                শ্রেণি: {paper.header.className} | বিষয়: {paper.header.subjectName} | অধ্যায়: {paper.chapterTitles.join(', ')}
              </p>
            </div>

            {/* MCQ Answers */}
            {paper.mcqs.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  ক-বিভাগ: বহুনির্বাচনী প্রশ্নের উত্তর
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {paper.mcqs.map((m, idx) => (
                    <div key={m.id} className="p-2 border border-slate-200 rounded">
                      <span className="font-bold">{toBengaliNumber(idx + 1)}. </span>
                      <span className="font-semibold text-emerald-800">
                        {BANGLA_OPTION_LABELS[m.correctOptionIndex]} {m.options[m.correctOptionIndex]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CQ Answers */}
            {paper.cqs.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  খ-বিভাগ: সৃজনশীল প্রশ্নের উত্তর ও মূল্যায়ন রুব্রিক
                </h4>
                <div className="space-y-4 text-xs">
                  {paper.cqs.map((cq, idx) => (
                    <div key={cq.id} className="p-3 border border-slate-200 rounded space-y-2">
                      <div className="font-bold text-slate-900">
                        প্রশ্ন নং {toBengaliNumber(idx + 1)} এর উত্তর:
                      </div>
                      {cq.subQuestions.map((sq) => (
                        <div key={sq.part} className="pl-2 border-l-2 border-slate-300">
                          <span className="font-bold">({sq.part}) [{sq.typeLabel} - মান {toBengaliNumber(sq.marks)}]: </span>
                          <span className="text-slate-700">{sq.sampleAnswer || 'পাঠ্যবই অনুযায়ী বিশ্লেষণ করতে হবে।'}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Short Answers */}
            {paper.shorts.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  গ-বিভাগ: সংক্ষিপ্ত প্রশ্নের উত্তর
                </h4>
                <div className="space-y-2 text-xs">
                  {paper.shorts.map((s, idx) => (
                    <div key={s.id} className="p-2 border border-slate-200 rounded">
                      <div className="font-bold text-slate-900">
                        {toBengaliNumber(idx + 1)}. {s.question}
                      </div>
                      <div className="text-slate-700 mt-1 pl-2">
                        {s.sampleAnswer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blank Answers */}
            {paper.blanks.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  ঘ-বিভাগ: শূন্যস্থানের সঠিক শব্দ
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {paper.blanks.map((b, idx) => (
                    <div key={b.id} className="p-2 border border-slate-200 rounded">
                      <span className="font-bold">{toBengaliNumber(idx + 1)}. </span>
                      <span className="font-semibold text-emerald-800">{b.blankAnswer}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Download Options & Diagnostic Helper Modal */}
      {showDownloadModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  প্রশ্নপত্র ডাউনলোড ও প্রিন্ট অপশনসমূহ
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  নিচের যেকোনো পদ্ধতি ব্যবহার করে সহজে সংগ্রহ করুন
                </p>
              </div>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Note about iframe download blocking */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>কেন ডাউনলোড আটকে যেতে পারে?</strong>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">
                    ব্রাউজার প্রিভিউতে (iframe sandbox) সরাসরি PDF বা প্রিন্ট উইন্ডো ব্লক হতে পারে। নিচে <span className="font-semibold text-amber-950">অফলাইন HTML</span> বা <span className="font-semibold text-amber-950">Word ফাইল</span> ব্যবহার করলে এই সমস্যা পুরোপুরি এড়ানো যায়।
                  </p>
                </div>
              </div>

              {/* Option 1: Standalone HTML (Most reliable) */}
              <div
                onClick={() => {
                  handleExportHtml();
                  setShowDownloadModal(false);
                }}
                className="p-4 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-50 transition-all cursor-pointer group flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-lg shrink-0 group-hover:bg-purple-200 transition-colors">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-900">
                      ১. অফলাইন প্রিন্ট-রেডি HTML (.html) — সর্বাধিক নির্ভরযোগ্য
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      এটি ডাউনলোড করে ডাবল-ক্লিক করলেই আপনার ব্রাউজারে সুন্দরভাবে খুলবে এবং উপরের 'প্রিন্ট / Save as PDF' বাটনে ক্লিক করলেই এক ক্লিকে নিখুঁত A4 PDF তৈরি হবে।
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-purple-700 shrink-0 bg-white px-2.5 py-1 rounded border border-purple-200">
                  ডাউনলোড
                </span>
              </div>

              {/* Option 2: Word Doc */}
              <div
                onClick={() => {
                  handleExportWord();
                  setShowDownloadModal(false);
                }}
                className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-all cursor-pointer group flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0 group-hover:bg-blue-200 transition-colors">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-900">
                      ২. Microsoft Word ডকুমেন্ট (.doc)
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      কম্পিউটারে বা ফোনে Microsoft Word বা Google Docs-এ প্রশ্ন বা নম্বর কাস্টমাইজ ও এডিট করার উপযোগী ফরম্যাট।
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-700 shrink-0 bg-white px-2.5 py-1 rounded border border-blue-200">
                  ডাউনলোড
                </span>
              </div>

              {/* Option 3: Plain text */}
              <div
                onClick={() => {
                  handleExportText();
                  setShowDownloadModal(false);
                }}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-100 transition-all cursor-pointer group flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-200 text-slate-700 rounded-lg shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      ৩. সাধারণ টেক্সট ফাইল (.txt)
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      অত্যন্ত হালকা এবং যেকোনো ডিভাইসের নোটপ্যাডে বা মেসেঞ্জারে কপি করে পাঠানো যায়।
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-700 shrink-0 bg-white px-2.5 py-1 rounded border border-slate-300">
                  ডাউনলোড
                </span>
              </div>

              {/* Option 4: Direct Browser Print */}
              <div
                onClick={() => {
                  setShowDownloadModal(false);
                  handlePrint();
                }}
                className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-all cursor-pointer group flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 group-hover:bg-emerald-200 transition-colors">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-900">
                      ৪. সরাসরি ব্রাউজার প্রিন্ট / PDF সংরক্ষণ
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      ব্রাউজারের প্রিন্ট ডায়ালগ খুলবে। সেখানে 'Destination'-এ <strong>Save as PDF</strong> সিলেক্ট করে সেভ করুন।
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700 shrink-0 bg-white px-2.5 py-1 rounded border border-emerald-200">
                  প্রিন্ট
                </span>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowDownloadModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
