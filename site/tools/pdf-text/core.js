(function (root) {
  'use strict';
  const MAX_CHARS = 100000;
  const MAX_LINES = 5000;
  const jp = '[\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}ー]';
  const jpStart = new RegExp('^' + jp, 'u');
  const jpEnd = new RegExp(jp + '$', 'u');
  const particleStart = /^[はがをにでとのもへや][\p{Script=Han}\p{Script=Katakana}]/u;

  function protectedLine(line) {
    if (!line || /^\s*$/.test(line)) return 'blank';
    if (/^\s|\s$/.test(line)) return 'spacing';
    if (/[0-9０-９]/.test(line)) return 'number';
    if (/https?:\/\/|www\.|@/i.test(line)) return 'address';
    if (/["'“”‘’「」『』«»]/.test(line)) return 'quote';
    if (/^(?:概要|要約|目次|はじめに|おわりに|まとめ|注意|備考|参考(?:資料|文献)?|付録|結論|背景|目的|方法|結果|考察)$/.test(line)) return 'heading';
    if (/^(?:#{1,6}(?:\s|$)|[-*+・●○■□▪▶>]|[①-⑳])/.test(line)) return 'structure';
    if (/[‐‑‒–—−－-]$/.test(line)) return 'hyphen';
    if (/[<>`]/.test(line)) return 'syntax';
    return null;
  }

  function boundary(before, after) {
    const protectedReason = protectedLine(before) || protectedLine(after);
    if (protectedReason) return { keep: true, reason: protectedReason };
    if (/[。.!?！？…：:;；]$/.test(before)) return { keep: true, reason: 'sentence' };
    if (jpEnd.test(before) &&
        ((/[はがをにでともへや、]$/.test(before) && jpStart.test(after) && /\p{Script=Hiragana}/u.test(after)) || particleStart.test(after))) {
      return { keep: false, replacement: '', reason: 'jp-continuation' };
    }
    if (/^[a-z]/.test(after) &&
        (/[A-Za-z],$/.test(before) || /\b(?:and|or|the|a|an|of|to|in|for|with)$/i.test(before))) {
      return { keep: false, replacement: ' ', reason: 'en-continuation' };
    }
    return { keep: true, reason: 'ambiguous' };
  }

  function limitError(code, message) {
    const error = new RangeError(message);
    error.code = code;
    return error;
  }

  function format(input) {
    if (typeof input !== 'string') throw new TypeError('文章は文字列で指定してください。');
    if (input.length > MAX_CHARS) throw limitError('TOO_LONG', '文章が長すぎます。10万文字以内に分けて貼り付けてください。');
    const parts = input.split(/(\r\n|\r|\n)/);
    const inputLines = input ? (parts.length + 1) / 2 : 0;
    if (inputLines > MAX_LINES) throw limitError('TOO_MANY_LINES', '行が多すぎます。5,000行以内に分けて貼り付けてください。');
    const output = [parts[0]];
    const edits = [];
    let offset = parts[0].length;
    let retained = 0;
    const reasons = Object.create(null);
    for (let i = 1; i < parts.length; i += 2) {
      const separator = parts[i];
      const next = parts[i + 1];
      const decision = boundary(parts[i - 1], next);
      reasons[decision.reason] = (reasons[decision.reason] || 0) + 1;
      if (decision.keep) {
        output.push(separator);
        retained++;
      } else {
        output.push(decision.replacement);
        edits.push({ start: offset, end: offset + separator.length, replacement: decision.replacement, reason: decision.reason });
      }
      output.push(next);
      offset += separator.length + next.length;
    }
    return { text: output.join(''), joined: edits.length, retained, inputLines, edits, reasons };
  }

  const api = Object.freeze({ format, MAX_CHARS, MAX_LINES });
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PdfText = api;
})(typeof globalThis === 'object' ? globalThis : this);
