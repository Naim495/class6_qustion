export function toBengaliNumber(num: number | string): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit, 10)]);
}

export function toEnglishNumber(str: string): number {
  const banglaDigitsMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  const engStr = str.replace(/[০-৯]/g, (match) => banglaDigitsMap[match] || match);
  const parsed = parseInt(engStr, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export const BANGLA_OPTION_LABELS = ['(ক)', '(খ)', '(গ)', '(ঘ)'];
export const BANGLA_CQ_PARTS = ['ক', 'খ', 'গ', 'ঘ'] as const;

/**
 * Universal safe downloader helper that handles iframes and avoids
 * premature URL.revokeObjectURL race conditions.
 */
function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  a.setAttribute('target', '_blank');
  document.body.appendChild(a);

  try {
    a.click();
  } catch (err) {
    console.warn('Direct a.click() failed, attempting window navigation:', err);
    window.location.href = url;
  }

  // CRITICAL FIX: Keep object URL alive for 60 seconds so browser download manager has time to stream it.
  setTimeout(() => {
    try {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    } catch (_) {}
  }, 60000);
}

/**
 * Download as editable Microsoft Word .doc file
 * Uses server endpoint first for 100% iframe compatibility, with client blob fallback.
 */
export async function downloadAsWordDoc(filename: string, contentHtml: string): Promise<void> {
  const finalFilename = filename.endsWith('.doc') ? filename : `${filename}.doc`;

  try {
    // Try server-side export endpoint first (bypasses iframe sandbox blob restrictions)
    const res = await fetch('/api/export/word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: finalFilename, html: contentHtml }),
    });

    if (res.ok) {
      const blob = await res.blob();
      triggerBrowserDownload(blob, finalFilename);
      return;
    }
  } catch (e) {
    console.warn('Server export endpoint failed, falling back to client-side blob:', e);
  }

  // Client-side fallback with UTF-8 BOM
  const header = `<!DOCTYPE html>
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
  ${contentHtml}
</body>
</html>`;

  const blob = new Blob(['\ufeff', header], {
    type: 'application/msword;charset=utf-8',
  });
  triggerBrowserDownload(blob, finalFilename);
}

/**
 * Download as standalone Print-Ready HTML file.
 * The user can open this file in any browser (Chrome, Edge, Firefox, Safari)
 * on computer or phone, and print directly to A4 PDF with perfect typography!
 */
export async function downloadAsHtmlFile(filename: string, contentHtml: string): Promise<void> {
  const finalFilename = filename.endsWith('.html') ? filename : `${filename}.html`;

  try {
    const res = await fetch('/api/export/html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: finalFilename, html: contentHtml }),
    });

    if (res.ok) {
      const blob = await res.blob();
      triggerBrowserDownload(blob, finalFilename);
      return;
    }
  } catch (e) {
    console.warn('Server HTML export failed, fallback to client:', e);
  }

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
  ${contentHtml}
</body>
</html>`;

  const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
  triggerBrowserDownload(blob, finalFilename);
}

/**
 * Download as clean formatted plain text (.txt) file
 */
export async function downloadAsTextFile(filename: string, textContent: string): Promise<void> {
  const finalFilename = filename.endsWith('.txt') ? filename : `${filename}.txt`;

  try {
    const res = await fetch('/api/export/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: finalFilename, text: textContent }),
    });

    if (res.ok) {
      const blob = await res.blob();
      triggerBrowserDownload(blob, finalFilename);
      return;
    }
  } catch (e) {
    console.warn('Server text export failed, fallback to client:', e);
  }

  const blob = new Blob(['\ufeff', textContent], {
    type: 'text/plain;charset=utf-8',
  });
  triggerBrowserDownload(blob, finalFilename);
}
