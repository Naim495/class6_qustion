export type SubjectId = 'science' | 'math' | 'bangla' | 'social' | 'ict' | 'wellbeing';

export interface Chapter {
  id: string;
  subjectId: SubjectId;
  chapterNumber: number;
  banglaNumber: string;
  title: string;
  summary: string;
  learningOutcomes: string[];
  content: string;
}

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  englishName: string;
  iconName: string;
  color: string;
  accentBg: string;
  description: string;
  chapters: Chapter[];
}

export type QuestionType = 'mcq' | 'cq' | 'short' | 'blank';

export interface McqQuestion {
  id: string;
  type: 'mcq';
  question: string;
  options: string[]; // 4 options
  correctOptionIndex: number; // 0-3
  explanation?: string;
  marks: number;
}

export interface CqSubQuestion {
  part: 'ক' | 'খ' | 'গ' | 'ঘ';
  typeLabel: 'জ্ঞানমূলক' | 'অনুধাবনমূলক' | 'প্রয়োগমূলক' | 'উচ্চতর দক্ষতামূলক';
  question: string;
  marks: number;
  sampleAnswer?: string;
}

export interface CqQuestion {
  id: string;
  type: 'cq';
  stimulus: string; // উদ্দীপক
  subQuestions: CqSubQuestion[];
  marks: number; // Usually 10
}

export interface ShortQuestion {
  id: string;
  type: 'short';
  question: string;
  sampleAnswer: string;
  marks: number;
}

export interface BlankQuestion {
  id: string;
  type: 'blank';
  sentenceWithBlank: string; // sentence containing '_____'
  blankAnswer: string;
  marks: number;
}

export type AnyQuestion = McqQuestion | CqQuestion | ShortQuestion | BlankQuestion;

export interface ExamHeaderInfo {
  schoolName: string;
  examTitle: string;
  subjectName: string;
  className: string;
  totalTime: string;
  totalMarks: number;
  instructions: string;
  academicYear: string;
}

export interface QuestionPaper {
  id: string;
  createdAt: string;
  header: ExamHeaderInfo;
  subjectId: SubjectId;
  chapterTitles: string[];
  difficulty: 'সহজ' | 'মধ্যম' | 'কঠিন' | 'মিশ্র';
  mcqs: McqQuestion[];
  cqs: CqQuestion[];
  shorts: ShortQuestion[];
  blanks: BlankQuestion[];
}
