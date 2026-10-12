// Inject failures without resource exhaustion or external data.
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const core=require('../site/assets/csv-core.js');
const ids=['files','encoding','delimiter','source','skipblank','run','demo','download','preview','diagnostics','status','excelSafety','outputEncoding'];
function node(){return {value:'',checked:true,disabled:false,textContent:'',children:[],listeners:{},append(...v){this.children.push(...v);},replaceChildren(){this.children=[];},addEventListener(e,fn){this.listeners[e]=fn;}};}
for(const failure of ['none','blob','url','element','append','click','remove','revoke','timer']){
  const ui=Object.fromEntries(ids.map(id=>[id,node()]));
  let creating=0,removed=0,revoked=0,clicked=0,body=[];const timers=[],blobs=[];
  const link={click(){if(failure==='click')throw Error('injected');clicked++;},remove(){removed++;if(failure==='remove')throw Error('injected');body=body.filter(x=>x!==link);}};
  const ctx={window:{CSVCore:core},TextDecoder,Uint8Array,
    document:{getElementById:id=>ui[id],createTextNode:text=>({textContent:text}),createElement(tag){if(tag!=='a')return node();if(failure==='element')throw Error('injected');return link;},body:{append(el){if(failure==='append')throw Error('injected');body.push(el);}}},
    Blob:class {constructor(parts,opts){creating++;if(failure==='blob')throw Error('private platform details');blobs.push({native:new Blob(parts,opts),parts});}},
    URL:{createObjectURL(){if(failure==='url')throw Error('private platform details');return 'blob:synthetic';},revokeObjectURL(){revoked++;if(failure==='revoke')throw Error('injected');}},
    setTimeout(fn,ms){assert.equal(ms,1200);if(failure==='timer')throw Error('injected');timers.push(fn);}}
  ;vm.runInNewContext(fs.readFileSync(require.resolve('../site/assets/app.js'),'utf8'),ctx);
  ui.outputEncoding.value='bom';ui.demo.listeners.click();
  assert.doesNotThrow(()=>ui.download.listeners.click());
  for(const fn of timers)assert.doesNotThrow(fn);
  if(['blob','url','element','append','click'].includes(failure)){
    assert.equal(ui.download.disabled,true);assert.match(ui.status.textContent,/保存を開始できません/);
    assert.doesNotMatch(ui.status.textContent,/private/);
    const count=creating;ui.download.listeners.click();assert.equal(creating,count); // No stale retry.
    ui.demo.listeners.click();assert.equal(ui.download.disabled,false);
  }else{assert.equal(ui.download.disabled,false);assert.equal(clicked,1);}
  if(!['blob','url'].includes(failure))assert.equal(revoked,1);
  assert.equal(body.length,failure==='remove'?1:0); // Best effort if the platform cleanup itself fails.
  if(!['blob','url','element'].includes(failure))assert.equal(removed,1);
  if(blobs.length){assert.equal(blobs[0].parts[0],'\uFEFF');assert.equal(blobs[0].native.size,Buffer.byteLength(blobs[0].parts.join('')));}
}
console.log('Download review: success and 8 injected failure/cleanup cases passed');
