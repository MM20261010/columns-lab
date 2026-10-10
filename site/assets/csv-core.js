/* 列そろえラボ: Dependency-free CSV functions. Node tests + browser. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CSVCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function parseCSV(content, delimiter=',') {
    if (!['\t',',',';'].includes(delimiter)) throw Error('対応していない区切り文字です');
    const text = String(content).replace(/^\uFEFF/, '');
    const rows = [];
    let row = [], value = '', state = 'start';
    function pushField() { row.push(value); value=''; state='start'; }
    function pushRow() { pushField(); rows.push(row); row=[]; }
    let line = 1;
    for (let i=0;i<text.length;i++) {
      const c = text[i];
      if (state === 'quoted') {
        if (c === '"') {
          if (text[i+1] === '"') { value += '"'; i++; }
          else state='afterQuote';
        } else { value += c; }
        if (c === '\n') line++;
        continue;
      }
      if (state === 'afterQuote') {
        if (c !== delimiter && c !== '\n' && c !== '\r') {
          throw Error(`${line}行目: 引用符の直後に余分な文字があります`);
        }
      }
      if (c === delimiter) {pushField();continue;}
      if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i+1] === '\n') i++;
        pushRow();line++;continue;
      }
      if (state === 'afterQuote') throw Error(`${line}行目: 引用符の書式が不正です`);
      if (c === '"') {
        if (state !== 'start') throw Error(`${line}行目: 項目の途中に引用符があります`);
        state='quoted';
      } else { value += c;state='unquoted'; }
    }
    if (state === 'quoted') throw Error(`${line}行目: 引用符が閉じていません`);
    if (state === 'start' && row.length === 0 && value === '') {
      return rows; // Empty file or input ends with a row break
    }
    pushRow();
    return rows;
  }

  // Detect separators from complete CSV records, respecting quoted newlines.
  function detectDelimiter(input) {
    const original=String(input).replace(/^\uFEFF/, '');
    // Never cut in the middle of a quoted field: a partial record makes
    // the correct separator look invalid. Sample up to ten full records.
    let quoted=false, records=0, end=original.length;
    for(let i=0;i<original.length;i++){
      if(original[i]==='"'){
        if(quoted && original[i+1]==='"'){i++;continue;}
        quoted=!quoted;
      }
      if(!quoted && (original[i]==='\n'||original[i]==='\r')){
        if(original[i]==='\r' && original[i+1]==='\n')i++;
        records++;
        if(records>=10 || i>=30000){end=i+1;break;}
      }
    }
    const text=original.slice(0,end);
    let best=',';let bestScore=-Infinity;
    for (const delimiter of [',','\t',';']) {
      try {
        const rows=parseCSV(text,delimiter).filter(r=>r.some(c=>c!==''));
        if(!rows.length) continue;
        const sample=rows.slice(0,10);
        const counts=sample.map(r=>r.length);
        const modal=counts.reduce((m,k)=>(m.set(k,(m.get(k)||0)+1),m),new Map());
        const agreement=Math.max(...modal.values());
        const maxCols=Math.max(...counts);
        const score=maxCols===1?0:maxCols*2+agreement*4 - (sample.length-agreement)*8;
        if(score>bestScore){bestScore=score;best=delimiter;}
      } catch(e) { /* Invalid format for this separator: try another */ }
    }
    return best;
  }

  function validateHeaders(raw) {
    if (!raw || !raw.length) throw Error('列名がありません');
    const headers=raw.map(v=>v.trim());
    if (headers.some(v=>!v)) throw Error('空の列名が含まれています');
    if (new Set(headers).size!==headers.length) throw Error('重複した列名があります');
    return headers;
  }
  function isBlankRow(row) {return row.every(v=>v==='');}

  function mergeTables(tables, opts={}) {
    if (!Array.isArray(tables) || tables.length<2) throw Error('CSVを2ファイル以上選んでください');
    const includeSource=opts.source !== false;
    const skipBlank=opts.skipBlank !== false;
    const columns=[], originals=[], summaries=[];
    let total=0;
    for(const t of tables){
      if(!t || !Array.isArray(t.rows) || !t.rows.length) throw Error(`${t?.name||'ファイル'}: データがありません`);
      const headers=validateHeaders(t.rows[0]);
      if(includeSource && headers.includes('_source_file')) throw Error(`${t.name}: 元ファイル名用の「_source_file」列と既存列名が重複しています。追加設定をオフにしてください`);
      const data=t.rows.slice(1).filter(r=>!(skipBlank&&isBlankRow(r)));
      for(let i=0;i<data.length;i++) {
        if(data[i].length>headers.length) throw Error(`${t.name}: データ${i+2}行目にヘッダーより多い項目があります`);
      }
      for(const h of headers) if(!columns.includes(h)) columns.push(h);
      originals.push({name:t.name,headers,data});
      total+=data.length;
    }
    for (const o of originals) {
      const colset=new Set(o.headers);
      summaries.push({name:o.name,rows:o.data.length,headers:o.headers,
        missing:columns.filter(c=>!colset.has(c)),
        extras:o.headers.filter(c=>!originals[0].headers.includes(c))});
    }
    if(includeSource) columns.push('_source_file');
    const rows=[];
    for(const o of originals) {
      const positions=new Map(o.headers.map((h,i)=>[h,i]));
      for(const r of o.data) rows.push(columns.map(h=>h==='_source_file'&&includeSource?o.name:
        positions.has(h) ? (r[positions.get(h)]??'') : ''));
    }
    return {columns,rows,summaries,total, source:includeSource};
  }
  function sanitizeForExcel(value) {
    const text=String(value??'');
    // Excel/Calc formula characters; start of value may include whitespace/control chars
    return /^[\u0000-\u0020]*[=+@\-]/.test(text) ? "'"+text : text;
  }
  function csvCell(v) {const text=String(v??'');return /[",\r\n]/.test(text)?'"'+text.replace(/"/g,'""')+'"':text;}
  function writeCSV(columns, rows, excelSafety=true) {
    const lines=[columns,...rows];
    return lines.map(r=>r.map(v=>csvCell(excelSafety?sanitizeForExcel(v):v)).join(',')).join('\r\n')+'\r\n';
  }
  return {parseCSV,detectDelimiter,validateHeaders,isBlankRow,mergeTables,sanitizeForExcel,csvCell,writeCSV};
});
