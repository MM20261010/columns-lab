/* 列そろえラボ: Dependency-free CSV functions. Node tests + browser. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CSVCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  // Provisional desktop-tested limits; mobile validation is still required.
  const LIMITS=Object.freeze({inputCells:500000,rows:100000,outputCells:500000,columns:256,outputCharacters:4000000});

  function parseCSV(content, delimiter=',', opts={}) {
    if (!['\t',',',';'].includes(delimiter)) throw Error('対応していない区切り文字です');
    const text = String(content).replace(/^\uFEFF/, '');
    const rows = [];
    let row = [], value = '', state = 'start', cells=0;
    const maxCells=opts.maxCells ?? LIMITS.inputCells;
    function pushField() {
      if(++cells>maxCells) throw Error('入力セル数の上限を超えました。ファイルを小さく分けてください');
      row.push(value); value=''; state='start';
    }
    function pushRow() {
      if(rows.length>=(opts.maxRows ?? LIMITS.rows+1))
        throw Error('入力行数の上限を超えました。ファイルを小さく分けてください');
      pushField(); rows.push(row); row=[];
    }
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
    const columns=[], columnSet=new Set(), originals=[], summaries=[];
    let total=0;
    for(const t of tables){
      if(!t || !Array.isArray(t.rows) || !t.rows.length) throw Error(`${t?.name||'ファイル'}: データがありません`);
      const headers=validateHeaders(t.rows[0]);
      if(includeSource && headers.includes('_source_file')) throw Error(`${t.name}: 元ファイル名用の「_source_file」列と既存列名が重複しています。追加設定をオフにしてください`);
      const data=t.rows.slice(1).filter(r=>!(skipBlank&&isBlankRow(r)));
      for(let i=0;i<data.length;i++) {
        if(data[i].length>headers.length) throw Error(`${t.name}: データ${i+2}行目にヘッダーより多い項目があります`);
      }
      for(const h of headers) if(!columnSet.has(h)){columnSet.add(h);columns.push(h);}
      originals.push({name:t.name,headers,data});
      total+=data.length;
    }
    const estimate=estimateMerge(originals,columns,includeSource);
    checkCapacity(estimate,opts.limits || LIMITS);
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
    return {columns,rows,summaries,total, source:includeSource,estimate};
  }

  // Count a conservative CSV upper bound without creating dense merged rows.
  // Includes separators, CRLF, repeated filenames, doubled quotes and up to
  // one protection prefix + two wrapping quotes per cell, for either export mode.
  function estimateMerge(originals,columns,includeSource) {
    const rows=originals.reduce((n,o)=>n+o.data.length,0), width=columns.length+(includeSource?1:0);
    const outputCells=(rows+1)*width;
    let characters=(rows+1)*(Math.max(0,width-1)+2)+3*outputCells;
    const cost=value=>{const text=String(value??'');let quotes=0;
      for(let i=0;i<text.length;i++)if(text[i]==='"')quotes++;
      return text.length+quotes;};
    for(const h of columns)characters+=cost(h);
    if(includeSource)characters+=cost('_source_file');
    for(const o of originals){
      for(const r of o.data)for(const value of r)characters+=cost(value);
      if(includeSource)characters+=o.data.length*cost(o.name);
    }
    return {rows,columns:width,outputCells,outputCharactersUpperBound:characters};
  }
  function checkCapacity(estimate,limits=LIMITS) {
    if(estimate.rows>limits.rows || estimate.columns>limits.columns || estimate.outputCells>limits.outputCells ||
       estimate.outputCharactersUpperBound>limits.outputCharacters)
      throw Error('結合後の行数・列数・セル数・出力サイズが上限を超えます。行や列を減らすか、ファイルを分けてください');
  }
  function sanitizeForExcel(value) {
    const text=String(value??'');
    // Keep the existing conservative policy: negative values are protected too.
    // Do not infer a numeric column type or silently bypass export protection.
    // OWASP includes full-width formula markers and leading tab/CR/LF.
    // Check whitespace for detection only; retain the original string unchanged.
    const prefix=/^[\u0000-\u0020\s]*[=+@\-＝＋＠－]/.test(text);
    const leadingBreak=/^[\u0000-\u0020\s]*[\t\r\n]/.test(text);
    return prefix || leadingBreak ? "'"+text : text;
  }
  function csvCell(v) {const text=String(v??'');return /[",\t\r\n]/.test(text)?'"'+text.replace(/"/g,'""')+'"':text;}
  function writeCSV(columns, rows, excelSafety=true) {
    // Avoid spreading an arbitrary number of rows as function/array elements.
    const lines=[];let characters=0;
    for(let i=-1;i<rows.length;i++){
      const row=i<0?columns:rows[i];
      const line=row.map(v=>csvCell(excelSafety?sanitizeForExcel(v):v)).join(',')+'\r\n';
      characters+=line.length;
      if(characters>LIMITS.outputCharacters)throw Error('出力サイズの上限を超えました。ファイルを分けてください');
      lines.push(line);
    }
    return lines.join('');
  }
  return {parseCSV,detectDelimiter,validateHeaders,isBlankRow,mergeTables,sanitizeForExcel,csvCell,writeCSV,LIMITS,estimateMerge,checkCapacity};
});
