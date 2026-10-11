(function(){
'use strict';
const c=window.CSVCore, $=id=>document.getElementById(id);
let last=null;
const inputControls=['files','encoding','delimiter','source','skipblank'];
function invalidateResult(){
  last=null;$('download').disabled=true;
  $('preview').replaceChildren();$('diagnostics').replaceChildren();
  message('入力または結合設定が変わりました。もう一度結合するか、架空サンプルをお試しください。');
}
for(const id of inputControls)$(id).addEventListener('change',invalidateResult);
const MAX_FILE=10*1024*1024, MAX_TOTAL=25*1024*1024;
function message(text,bad=false){$('status').textContent=text;$('status').className=bad?'status bad':'status';}
function detectAndDecode(bytes, preferred){
  const decode=enc=>new TextDecoder(enc,{fatal:true}).decode(bytes);
  if (preferred!=='auto')return decode(preferred);
  if (bytes[0]===0xEF && bytes[1]===0xBB && bytes[2]===0xBF) return decode('utf-8');
  try {return decode('utf-8');} catch(e){return decode('shift_jis');}
}
async function readAll() {
  const files=Array.from($('files').files || []);
  if(files.length<2)throw Error('2つ以上のCSVファイルを選択してください');
  const totalSize=files.reduce((n,f)=>n+f.size,0);
  if(totalSize>MAX_TOTAL)throw Error('合計25MB以内のCSVを選択してください');
  for (const f of files) if(f.size>MAX_FILE)throw Error(`${f.name}: 10MBを超えています`);
  const tables=[];let inputCells=0;
  for(const f of files){
    let contents;
    try{contents=detectAndDecode(new Uint8Array(await f.arrayBuffer()),$('encoding').value);}
    catch(e){throw Error(`${f.name}: 文字コードを読み取れません。文字コードを手動で指定してください`);}
    let delimiter=$('delimiter').value;
    if(delimiter==='auto')delimiter=c.detectDelimiter(contents);
    if(delimiter==='tab')delimiter='\t';
    let rows;
    try{rows=c.parseCSV(contents,delimiter,{maxCells:c.LIMITS.inputCells-inputCells});inputCells+=rows.reduce((n,r)=>n+r.length,0);}catch(e){throw Error(`${f.name}: ${e.message}`);}
    if(!rows.length)throw Error(`${f.name}: 空のCSVです`);
    tables.push({name:f.name,rows});
  }
  return tables;
}
function renderPreview(out){
  const table=$('preview');table.replaceChildren();
  const head=document.createElement('tr');
  for(const col of out.columns){const el=document.createElement('th');el.textContent=col;head.append(el);}
  const thead=document.createElement('thead');thead.append(head);table.append(thead);
  const tbody=document.createElement('tbody');
  for(const row of out.rows.slice(0,12)){
    const tr=document.createElement('tr');
    for(const item of row){const td=document.createElement('td');td.textContent=item;tr.append(td);}tbody.append(tr);
  }
  table.append(tbody);
}
function renderDiagnostics(out){
  const box=$('diagnostics');box.replaceChildren();
  const title=document.createElement('h3');title.textContent='列名の照合結果';box.append(title);
  for(const s of out.summaries){
    const p=document.createElement('p');
    const bold=document.createElement('strong');bold.textContent=s.name; p.append(bold);
    p.append(document.createTextNode(`：${s.rows.toLocaleString('ja-JP')}行 / ${s.headers.length}列`));box.append(p);
    if(s.missing.length){const notice=document.createElement('p');notice.className='warning';notice.textContent=`他ファイルにある列が存在しません（空欄で補完）：${s.missing.join('、')}`;box.append(notice);}
    if(s.extras.length){const notice=document.createElement('p');notice.className='minor';notice.textContent=`1つ目のCSVにはない列：${s.extras.join('、')}`;box.append(notice);}
    if(!s.missing.length&&!s.extras.length){const notice=document.createElement('p');notice.className='ok';notice.textContent='列名に不足・追加はありません';box.append(notice);}
  }
}
$('run').addEventListener('click',async()=>{
  $('run').disabled=true;$('download').disabled=true;last=null;
  $('demo').disabled=true;
  for(const id of inputControls)$(id).disabled=true;
  $('preview').replaceChildren();$('diagnostics').replaceChildren();
  message('CSVを読み込んでいます…');
  try{
    const tables=await readAll();
    last=c.mergeTables(tables,{source:$('source').checked,skipBlank:$('skipblank').checked});
    renderPreview(last);renderDiagnostics(last);
    message(`${tables.length}ファイルを結合しました。${last.total.toLocaleString('ja-JP')}データ行・${last.columns.length}列。先頭12行を表示中。`);
    $('download').disabled=false;
  }catch(e){message(e.message,true);}
  finally{
    $('run').disabled=false;$('demo').disabled=false;
    for(const id of inputControls)$(id).disabled=false;
  }
});
$('download').addEventListener('click',()=>{
  if(!last)return;
  let payload;
  try {payload=c.writeCSV(last.columns,last.rows,$('excelSafety').checked);}
  catch(e){last=null;$('download').disabled=true;message(e.message,true);return;}
  const bom=$('outputEncoding').value==='bom'?'\uFEFF':'';
  const objectURL=URL.createObjectURL(new Blob([bom,payload],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');link.href=objectURL;link.download='merged_'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(objectURL),1200);
});
$('demo').addEventListener('click',()=>{
  $('files').value='';
  $('preview').replaceChildren();$('diagnostics').replaceChildren();
  const a=c.parseCSV('日付,担当,金額\n2026-10-01,田中,100\n2026-10-02,佐藤,200');
  const b=c.parseCSV('金額,日付,拠点\n300,2026-10-03,大阪\n400,2026-10-04,東京');
  last=c.mergeTables([{name:'東京.csv',rows:a},{name:'大阪.csv',rows:b}],{source:$('source').checked,skipBlank:$('skipblank').checked});
  renderPreview(last);renderDiagnostics(last);
  message('架空のサンプル2ファイルを結合しました。自分のCSVを使うにはファイルを選び直してください。');
  $('download').disabled=false;
});
})();
