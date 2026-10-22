import React from 'react';
import { X, AlertCircle, CheckCircle2, ArrowRight, Code2 } from 'lucide-react';

interface WhyPreviousFailedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhyPreviousFailedModal: React.FC<WhyPreviousFailedModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              কেন আগের প্রোজেক্টটি কাজ করছিল না? (সমস্যার বিশ্লেষণ ও সমাধান)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Technical Diagnostic & Architecture Resolution
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm text-slate-700">
          {/* Issue 1 */}
          <div className="p-4 rounded-lg bg-rose-50/70 border border-rose-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-rose-900">
                  ১. লোকালহোস্ট ও ব্যাকএন্ড সংযোগ বিচ্ছিন্নতা (CORS & Connection Refused)
                </h4>
                <p className="mt-1 text-xs text-rose-800 leading-relaxed">
                  আপনার React কোডে <code className="bg-rose-100 px-1 py-0.5 rounded text-rose-900 font-mono">http://localhost:8000/api/generate-questions/</code> এ ফেচ করা হচ্ছিল। ক্লাউড বা ওয়েব ব্রাউজারে আলাদা পাইথন জ্যাঙ্গো ব্যাকএন্ড সক্রিয় না থাকায় ব্রাউজার <span className="font-semibold">"ERR_CONNECTION_REFUSED"</span> এবং <span className="font-semibold">CORS policy</span> এরর দিয়ে রিকোয়েস্ট ব্লক করে দিচ্ছিল।
                </p>
              </div>
            </div>
          </div>

          {/* Issue 2 */}
          <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900">
                  ২. বাতিলকৃত মডেল এবং সেকেলে জেনারেটিভ এআই লাইব্রেরি
                </h4>
                <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                  কোডে <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">gemini-1.5-flash</code> এবং সেকেলে <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">import google.generativeai as genai</code> ব্যবহার করা হয়েছিল। গুগল এআই স্টুডিওতে বর্তমানে আধুনিক <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">@google/genai</code> SDK এবং উন্নত <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">gemini-3.8-flash</code> মডেল ব্যবহার আবশ্যক।
                </p>
              </div>
            </div>
          </div>

          {/* Issue 3 */}
          <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">
                  ৩. বাংলা ইউনিকোড যুক্তাক্ষর ও ফন্ট রেন্ডারিং সমস্যা
                </h4>
                <p className="mt-1 text-xs text-blue-800 leading-relaxed">
                  সাধারণ PDF এক্সট্রাক্টর বা jspdf এ বাংলা ফন্ট এম্বেড না করলে ক্ষ, ঙ্ক, ষ্ণ, ঞ্জ এর মতো যুক্তবর্ণ ভেঙে যায় বা প্রশ্নপত্র প্রিন্ট ও পড়ার অযোগ্য হয়ে পড়ে।
                </p>
              </div>
            </div>
          </div>

          {/* Resolution */}
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-emerald-900">
                  নতুন ফুল-স্ট্যাক প্রজেক্টে কীভাবে সমাধান করা হয়েছে?
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs text-emerald-800">
                  <li className="flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span><strong>একীভূত ফুল-স্ট্যাক এক্সপ্রেস ব্যাকএন্ড:</strong> আলাদা জ্যাঙ্গো সার্ভার কনফিগার করার ঝামেলা নেই; এক্সপ্রেস ব্যাকএন্ড সরাসরি একই পোর্টে রান করে।</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span><strong>লেটেস্ট Gemini 3.8 Flash ও স্কিমা:</strong> নির্ভরযোগ্য JSON আউটপুট স্কিমাসহ নির্ভুল বাংলা প্রশ্ন প্রণয়ন।</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span><strong>বিল্ট-ইন NCTB ষষ্ঠ শ্রেণির পাঠ্যসূচি:</strong> বিজ্ঞান, গণিত, বাংলা, সমাজ, আইসিটি সহ প্রতিটি অধ্যায়ের মূল বিষয়বস্তু ইতিমধ্যে লোড করা আছে।</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span><strong>প্রকৃত পরীক্ষার প্রিন্ট লেআউট ও Word এক্সপোর্ট:</strong> নির্ভুল বাংলা ফন্টে A4 সাইজ প্রিন্ট ও এডিটেবল Word ফাইল ডাউনলোড।</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            বুঝেছি, প্রশ্নপত্র তৈরি শুরু করি
          </button>
        </div>
      </div>
    </div>
  );
};
