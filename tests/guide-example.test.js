const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const C = require('../site/assets/csv-core.js');
const code = fs.readFileSync(require.resolve('../site/assets/guide-example.js'), 'utf8');
const ids = ['example-run','example-save','example-clear','example-check-file','example-status',
  'example-save-status','example-check-status','example-preview'];
function node(){return {children:[],listeners:{},disabled:false,value:'',textContent:'',className:'',
  append(...v){this.children.push(...v)},replaceChildren(...v){this.children=v},
  addEventListener(name,fn){this.listeners[name]=fn},click(){},remove(){}}}
function setup({core=C,failSave=false}={}){
  const ui=Object.fromEntries(ids.map(x=>[x,node()]));
  const blobs=[],revoked=[],timers=[];
  const ctx={window:{CSVCore:core},document:{getElementById:id=>ui[id],createElement:node,body:node()},
    Blob,TextDecoder,URL:{createObjectURL(blob){if(failSave)throw Error('denied');blobs.push(blob);return 'blob:test'},
      revokeObjectURL(url){revoked.push(url)}},setTimeout(fn){timers.push(fn)}};
  vm.runInNewContext(code,ctx);
  const click=id=>ui[id].listeners.click();
  const read=async file=>{ui['example-check-file'].files=[file];await ui['example-check-file'].listeners.change()};
  return {ui,blobs,revoked,timers,click,read};
}
const bytes=text=>new TextEncoder().encode(text);
const file=text=>({size:bytes(text).length,arrayBuffer:async()=>bytes(text).buffer});
const expected=[['日付','担当','金額','拠点'],['2026-10-01','田中','100',''],
  ['2026-10-02','佐藤','200',''],['2026-10-03','','300','大阪'],['2026-10-04','','400','東京']];
(async()=>{
  const results=[];
  function check(name,fn){fn();results.push({name,passed:true})}
  const s=setup();
  check('initial save and read disabled',()=>{assert(s.ui['example-save'].disabled);assert(s.ui['example-check-file'].disabled)});
  s.click('example-run');
  check('sample merged in same page',()=>{assert(!s.ui['example-save'].disabled);assert.match(s.ui['example-status'].textContent,/4行・4列/)});
  s.click('example-save');
  const csv=await s.blobs[0].text();
  check('saved values match independent expected matrix',()=>assert.deepEqual(C.parseCSV(csv),expected));
  check('save start does not claim saved location',()=>assert.match(s.ui['example-save-status'].textContent,/保存を開始.*保存先はブラウザー/));
  s.timers.forEach(fn=>fn());
  check('blob released',()=>assert.deepEqual(s.revoked,['blob:test']));
  await s.read(file(csv));
  check('round trip read',()=>assert.match(s.ui['example-check-status'].textContent,/内容を読み取れました/));
  await s.read(file(csv.replace('100','101')));
  check('wrong amount rejected',()=>assert.match(s.ui['example-check-status'].textContent,/確認できません/));
  await s.read(file('a,b\n"unterminated'));
  check('malformed input rejected',()=>assert.match(s.ui['example-check-status'].textContent,/確認できません/));
  await s.read({size:9000,arrayBuffer:async()=>{throw Error('must not read')}});
  check('oversize rejected before read',()=>assert.match(s.ui['example-check-status'].textContent,/確認できません/));
  await s.read({size:1,arrayBuffer:async()=>new Uint8Array([255]).buffer});
  check('invalid UTF8 rejected',()=>assert.match(s.ui['example-check-status'].textContent,/確認できません/));
  let resolveOld;
  const pending=s.read({size:csv.length,arrayBuffer:()=>new Promise(resolve=>{resolveOld=resolve})});
  s.click('example-clear');resolveOld(bytes(csv).buffer);await pending;
  check('reset invalidates pending read and export',()=>{assert(s.ui['example-save'].disabled);assert(s.ui['example-check-file'].disabled);assert(!s.ui['example-check-status'].textContent.includes('読み取れました'))});
  s.click('example-run');s.click('example-save');
  let r1;
  const p1=s.read({size:csv.length,arrayBuffer:()=>new Promise(resolve=>{r1=resolve})});
  await s.read(file('wrong'));r1(bytes(csv).buffer);await p1;
  check('new selection wins over slow old read',()=>assert.match(s.ui['example-check-status'].textContent,/確認できません/));
  const failure=setup({failSave:true});failure.click('example-run');failure.click('example-save');
  check('save failure is not success',()=>{assert.match(failure.ui['example-save-status'].textContent,/開始できません/);assert(failure.ui['example-check-file'].disabled)});
  const missing=setup({core:null});missing.click('example-run');
  check('missing core fails closed',()=>{assert(missing.ui['example-save'].disabled);assert.match(missing.ui['example-status'].textContent,/読み込めません/)});
  const html=fs.readFileSync(require.resolve('../site/guides/csv-column-merge/index.html'),'utf8');
  check('original guide and tool link remain',()=>{assert(html.includes('無料ツールで結合する手順'));assert(html.includes('/tools/csv-merge/'));assert(html.includes('先頭ゼロ'))});
  check('new code has no data transmission or persistent storage',()=>assert(!/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|indexedDB|innerHTML|eval\(/.test(code)));
  console.log(JSON.stringify({synthetic:true,tests:results.length,results,browser:false},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
