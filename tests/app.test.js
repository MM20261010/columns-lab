const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const core=require('../site/assets/csv-core.js');
function node(){return {value:'',checked:true,disabled:false,textContent:'',className:'',children:[],listeners:{},append(...x){this.children.push(...x);},replaceChildren(){this.children=[];},addEventListener(event,fn){this.listeners[event]=fn;}};}
const ids=['files','encoding','delimiter','source','skipblank','run','demo','download','preview','diagnostics','status','excelSafety','outputEncoding'];
const elements=Object.fromEntries(ids.map(id=>[id,node()]));
const context={window:{CSVCore:core},document:{getElementById:id=>elements[id],createElement:node,createTextNode:text=>({textContent:text})},TextDecoder,Uint8Array};
vm.runInNewContext(fs.readFileSync(require.resolve('../site/assets/app.js'),'utf8'),context);
elements.demo.listeners.click();
assert.equal(elements.download.disabled,false);
assert.ok(elements.preview.children.length>0);
elements.source.checked=false; elements.source.listeners.change();
assert.equal(elements.download.disabled,true);
assert.equal(elements.preview.children.length,0);
assert.match(elements.status.textContent,/もう一度/);
elements.demo.listeners.click();
elements.files.listeners.change();
assert.equal(elements.download.disabled,true);
console.log('UI result invalidation tests: passed');

(async()=>{
  // Tiny budgets exercise the real parser and multi-file application path
  // without allocating a huge synthetic CSV in a test.
  const smallCore={...core,LIMITS:{...core.LIMITS,inputCells:6}};
  const ui=Object.fromEntries(ids.map(id=>[id,node()]));
  const ctx={...context,window:{CSVCore:smallCore},document:{getElementById:id=>ui[id],createElement:node,createTextNode:text=>({textContent:text})}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../site/assets/app.js'),'utf8'),ctx);
  ui.encoding.value='auto';ui.delimiter.value='auto';
  const bytes=new TextEncoder().encode('a,b\n1,2');
  ui.files.files=['fixture-a','fixture-b'].map(name=>({name,size:bytes.length,arrayBuffer:async()=>bytes.buffer}));
  await ui.run.listeners.click();
  assert.equal(ui.download.disabled,true);
  assert.match(ui.status.textContent,/入力セル数/);
  assert.equal(ui.run.disabled,false);
  assert.equal(ui.files.disabled,false);
  smallCore.LIMITS.inputCells=8;
  await ui.run.listeners.click();
  assert.equal(ui.download.disabled,false);
  smallCore.writeCSV=()=>{throw Error('出力サイズの上限を超えました');};
  ui.download.listeners.click();
  assert.equal(ui.download.disabled,true);
  assert.match(ui.status.textContent,/出力サイズ/);
  console.log('UI capacity budget/error recovery tests: passed');
})().catch(error=>{console.error(error);process.exitCode=1;});
