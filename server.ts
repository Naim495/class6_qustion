import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Helper to initialize GoogleGenAI client safely
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Question Generation Endpoint
app.post('/api/generate-questions', async (req: Request, res: Response) => {
  try {
    const {
      subject = 'বিজ্ঞান',
      chapter = 'উদ্ভিদ ও প্রাণীর কোষীয় সংগঠন',
      contentText = '',
      questionTypes = ['mcq', 'cq', 'short', 'blank'],
      difficulty = 'মধ্যম',
      countMcq = 5,
      countCq = 1,
      countShort = 2,
      countBlank = 2,
      examTitle = 'ষষ্ঠ শ্রেণি মূল্যায়ন',
      instructions = 'সকল প্রশ্নের উত্তর দাও।',
      schoolName = 'সরকারি উচ্চ বিদ্যালয়',
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Missing API Key',
        message: 'GEMINI_API_KEY is not configured in the server environment.',
      });
    }

    const ai = getGeminiClient();

    const prompt = `
আপনি জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) বাংলাদেশ-এর ষষ্ঠ শ্রেণির (Class 6) একজন অভিজ্ঞ মাস্টার ট্রেইনার ও প্রশ্ন প্রণেতা।
নিম্নলিখিত পাঠ্যাংশ ও তথ্যের ভিত্তিতে একটি প্রমিত, নির্ভুল ও পূর্ণাঙ্গ প্রশ্নপত্র তৈরি করুন।

বিষয়: ${subject}
অধ্যায়: ${chapter}
কাঠিন্যের মাত্রা: ${difficulty}
পরীক্ষার শিরোনাম: ${examTitle}
বিদ্যালয়: ${schoolName}

পাঠ্যবইয়ের মূল বিষয়বস্তু / পাঠ্যাংশ:
"""
${contentText.slice(0, 4000)}
"""

অনুরোধকৃত প্রশ্নের সংখ্যা:
- বহুনির্বাচনী প্রশ্ন (MCQ): ${questionTypes.includes('mcq') ? countMcq : 0} টি
- সৃজনশীল প্রশ্ন (CQ): ${questionTypes.includes('cq') ? countCq : 0} টি
- সংক্ষিপ্ত প্রশ্ন (Short Answer): ${questionTypes.includes('short') ? countShort : 0} টি
- শূন্যস্থান পূরণ (Fill in the blanks): ${questionTypes.includes('blank') ? countBlank : 0} টি

বিশেষ নির্দেশনাবলী:
১. প্রশ্নের ভাষা অবশ্যই শুদ্ধ, প্রাঞ্জল ও প্রমিত বাংলায় হতে হবে। ব্যাকরণিক বা বানান ভুল থাকা চলবে না।
২. বহুনির্বাচনী (MCQ)-তে ৪টি উপযুক্ত বিকল্প (ক, খ, গ, ঘ) দিন এবং correctOptionIndex (০ থেকে ৩ পর্যন্ত পূর্ণসংখ্যা) নির্দিষ্ট করুন। সঙ্গে সহজ বাংলা ব্যাখ্যা দিন।
৩. সৃজনশীল প্রশ্নে (CQ) ষষ্ঠ শ্রেণির শিক্ষার্থীদের উপযোগী একটি বাস্তবসম্মত উদ্দীপক (scenario/stimulus) লিখুন। এরপর (ক) জ্ঞানমূলক (১ নম্বর), (খ) অনুধাবনমূলক (২ নম্বর), (গ) প্রয়োগমূলক (৩ নম্বর), এবং (ঘ) উচ্চতর দক্ষতামূলক (৪ নম্বর) মোট ১০ নম্বরের ৪টি সুস্পষ্ট উপ-প্রশ্ন ও তাদের নমুনা উত্তর দিন।
৪. সংক্ষিপ্ত প্রশ্নে সংক্ষিপ্ত উত্তর এবং শূন্যস্থান পূরণে বাক্যের মধ্যে '_____' চিহ্ন ব্যবহার করুন।
৫. উত্তরগুলো প্রদত্ত JSON স্কিমা অনুযায়ী নির্ভুলভাবে প্রদান করুন।
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an authoritative NCTB Class 6 curriculum examiner. Generate culturally authentic, academically accurate Bengali examination questions strictly in JSON format matching the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schoolName: { type: Type.STRING },
            examTitle: { type: Type.STRING },
            subjectName: { type: Type.STRING },
            className: { type: Type.STRING },
            totalTime: { type: Type.STRING },
            totalMarks: { type: Type.NUMBER },
            instructions: { type: Type.STRING },
            mcqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctOptionIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  marks: { type: Type.NUMBER },
                },
                required: ['question', 'options', 'correctOptionIndex', 'marks'],
              },
            },
            cqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stimulus: { type: Type.STRING },
                  subQuestions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        part: { type: Type.STRING, enum: ['ক', 'খ', 'গ', 'ঘ'] },
                        typeLabel: {
                          type: Type.STRING,
                          enum: ['জ্ঞানমূলক', 'অনুধাবনমূলক', 'প্রয়োগমূলক', 'উচ্চতর দক্ষতামূলক'],
                        },
                        question: { type: Type.STRING },
                        marks: { type: Type.NUMBER },
                        sampleAnswer: { type: Type.STRING },
                      },
                      required: ['part', 'typeLabel', 'question', 'marks'],
                    },
                  },
                  marks: { type: Type.NUMBER },
                },
                required: ['stimulus', 'subQuestions', 'marks'],
              },
            },
            shorts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  sampleAnswer: { type: Type.STRING },
                  marks: { type: Type.NUMBER },
                },
                required: ['question', 'sampleAnswer', 'marks'],
              },
            },
            blanks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sentenceWithBlank: { type: Type.STRING },
                  blankAnswer: { type: Type.STRING },
                  marks: { type: Type.NUMBER },
                },
                required: ['sentenceWithBlank', 'blankAnswer', 'marks'],
              },
            },
          },
          required: ['subjectName', 'className', 'totalTime', 'totalMarks', 'mcqs', 'cqs', 'shorts', 'blanks'],
        },
      },
    });

    const rawJson = response.text || '{}';
    const parsedData = JSON.parse(rawJson);

    // Format with generated IDs and structure
    const formattedPaper = {
      id: `paper-${Date.now()}`,
      createdAt: new Date().toISOString(),
      header: {
        schoolName: parsedData.schoolName || schoolName,
        examTitle: parsedData.examTitle || examTitle,
        subjectName: parsedData.subjectName || subject,
        className: parsedData.className || 'ষষ্ঠ শ্রেণি',
        totalTime: parsedData.totalTime || '২ ঘণ্টা',
        totalMarks: parsedData.totalMarks || 50,
        instructions: parsedData.instructions || instructions,
        academicYear: '২০২৬',
      },
      subjectId: req.body.subjectId || 'science',
      chapterTitles: [chapter],
      difficulty,
      mcqs: (parsedData.mcqs || []).map((m: any, idx: number) => ({
        id: `mcq-${idx + 1}-${Date.now()}`,
        type: 'mcq',
        question: m.question,
        options: m.options,
        correctOptionIndex: typeof m.correctOptionIndex === 'number' ? m.correctOptionIndex : 0,
        explanation: m.explanation || '',
        marks: m.marks || 1,
      })),
      cqs: (parsedData.cqs || []).map((c: any, idx: number) => ({
        id: `cq-${idx + 1}-${Date.now()}`,
        type: 'cq',
        stimulus: c.stimulus,
        subQuestions: (c.subQuestions || []).map((sq: any) => ({
          part: sq.part || 'ক',
          typeLabel: sq.typeLabel || 'জ্ঞানমূলক',
          question: sq.question,
          marks: sq.marks || 1,
          sampleAnswer: sq.sampleAnswer || '',
        })),
        marks: c.marks || 10,
      })),
      shorts: (parsedData.shorts || []).map((s: any, idx: number) => ({
        id: `short-${idx + 1}-${Date.now()}`,
        type: 'short',
        question: s.question,
        sampleAnswer: s.sampleAnswer || '',
        marks: s.marks || 2,
      })),
      blanks: (parsedData.blanks || []).map((b: any, idx: number) => ({
        id: `blank-${idx + 1}-${Date.now()}`,
        type: 'blank',
        sentenceWithBlank: b.sentenceWithBlank,
        blankAnswer: b.blankAnswer || '',
        marks: b.marks || 1,
      })),
    };

    return res.json({
      status: 'success',
      data: formattedPaper,
    });
  } catch (err: any) {
    console.error('Error in /api/generate-questions:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Failed to generate question paper with Gemini API',
    });
  }
});

// Server-side Export Endpoints (Guaranteed reliable downloads in iframe sandboxes)
app.post('/api/export/word', (req: Request, res: Response) => {
  try {
    const { filename = 'nctb_class6_question_paper.doc', html = '' } = req.body;
    const cleanFilename = encodeURIComponent(filename.endsWith('.doc') ? filename : `${filename}.doc`);

    res.setHeader('Content-Type', 'application/msword; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"; filename*=UTF-8''${cleanFilename}`);

    const docContent = `\uFEFF<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${filename}</title>
  <style>
    body { font-family: 'Hind Siliguri', 'SolaimanLipi', 'Vrinda', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
    h1 { font-size: 16pt; text-align: center; margin-bottom: 2px; }
    h2 { font-size: 13pt; text-align: center; margin-top: 2px; margin-bottom: 4px; }
    .exam-header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 8px; margin-bottom: 16px; }
    .meta-table { width: 100%; margin-top: 6px; }
    .meta-table td { padding: 2px 4px; font-weight: bold; }
    .section-title { font-size: 12pt; font-weight: bold; background-color: #f0f0f0; padding: 4px; margin: 16px 0 8px 0; border-left: 3px solid #333; }
    .stimulus { background-color: #fcfcfc; padding: 8px; border: 1px dashed #aaa; margin-bottom: 6px; font-style: italic; }
    .q-item { margin-bottom: 12px; }
    .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-left: 16px; }
    .marks { float: right; font-weight: bold; }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

    return res.send(docContent);
  } catch (err: any) {
    console.error('Export Word error:', err);
    return res.status(500).send('Export failed');
  }
});

app.post('/api/export/html', (req: Request, res: Response) => {
  try {
    const { filename = 'nctb_class6_question_paper.html', html = '' } = req.body;
    const cleanFilename = encodeURIComponent(filename.endsWith('.html') ? filename : `${filename}.html`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"; filename*=UTF-8''${cleanFilename}`);

    const standaloneHtml = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>${filename}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 1.5cm; }
    body { font-family: 'Hind Siliguri', system-ui, sans-serif; font-size: 12pt; line-height: 1.6; color: #111; max-width: 800px; margin: 0 auto; padding: 20px; }
    .exam-header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 10px; margin-bottom: 20px; }
    h1 { font-size: 20pt; margin: 0 0 5px 0; }
    h2 { font-size: 14pt; margin: 0 0 10px 0; color: #444; }
    .meta-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-weight: 600; }
    .meta-table td { padding: 4px 6px; }
    .section-title { font-size: 13pt; font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 3px; margin: 25px 0 10px 0; }
    .stimulus { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; margin: 8px 0; font-style: italic; }
    .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-left: 15px; margin-top: 5px; }
    .marks { float: right; font-weight: bold; }
    .print-btn-bar { background: #f1f5f9; padding: 12px; border-radius: 8px; text-align: center; margin-bottom: 25px; border: 1px solid #e2e8f0; }
    .btn { background: #047857; color: white; border: none; padding: 8px 20px; font-size: 11pt; border-radius: 6px; cursor: pointer; font-weight: bold; }
    .btn:hover { background: #065f46; }
    @media print {
      .print-btn-bar { display: none !important; }
      body { padding: 0; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div class="print-btn-bar">
    <button class="btn" onclick="window.print()">🖨️ প্রিন্ট করুন বা PDF হিসেবে সংরক্ষণ করুন (Ctrl + P)</button>
    <div style="font-size: 10pt; color: #64748b; margin-top: 6px;">প্রিন্ট ডায়ালগে "Save as PDF" সিলেক্ট করে সরাসরি PDF ডাউনলোড করুন।</div>
  </div>
  ${html}
</body>
</html>`;

    return res.send(standaloneHtml);
  } catch (err: any) {
    console.error('Export HTML error:', err);
    return res.status(500).send('Export failed');
  }
});

app.post('/api/export/text', (req: Request, res: Response) => {
  try {
    const { filename = 'nctb_class6_question_paper.txt', text = '' } = req.body;
    const cleanFilename = encodeURIComponent(filename.endsWith('.txt') ? filename : `${filename}.txt`);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"; filename*=UTF-8''${cleanFilename}`);

    return res.send(`\uFEFF${text}`);
  } catch (err: any) {
    console.error('Export Text error:', err);
    return res.status(500).send('Export failed');
  }
});

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
