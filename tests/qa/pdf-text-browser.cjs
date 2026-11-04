// Actual Chromium/clipboard CI acceptance; synthetic strings only.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const cases=require('../../experiments/pdf-text/tests/cases.json');
(async()=>{
 const browser=await chromium.launch({headless:true});console.log('BROWSER',browser.version());
 try{
  for(const width of [320,360,390]){
   const context=await browser.newContext({viewport:{width,height:850},permissions:['clipboard-read','clipboard-write']});const page=await context.newPage(),errors=[],external=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8765/'))external.push({url:r.url(),method:r.method()});});
   await page.goto('http://127.0.0.1:8765/tools/pdf-text/');
   const norm=x=>x.replace(/\r\n|\r/g,'\n');
   for(const c of cases){
    await page.fill('#source',c.input);assert.equal(await page.inputValue('#source'),norm(c.input),c.id+' original');assert.equal(await page.inputValue('#result'),norm(c.expected),c.id+' result');
    if(c.expected){await page.click('#copy');await page.waitForFunction(()=>document.querySelector('#status').textContent==='コピーしました。');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),norm(c.expected),c.id+' clipboard');}
   }
   const original='この文章は\n画面幅で折り返されています。\n\n・項目を保持';await page.fill('#source',original);
   await page.fill('#result','手動編集🙂\n"引用" 00123 <tag>');await page.click('#copy');await page.waitForFunction(()=>document.querySelector('#status').textContent==='コピーしました。');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'手動編集🙂\n"引用" 00123 <tag>');assert.equal(await page.inputValue('#source'),original);
   await page.click('#restore');assert.equal(await page.inputValue('#result'),original);await page.click('#reformat');assert.equal(await page.inputValue('#result'),'この文章は画面幅で折り返されています。\n\n・項目を保持');
   await page.fill('#source','あ'.repeat(100000));assert.equal((await page.inputValue('#result')).length,100000);await page.click('#copy');await page.waitForFunction(()=>document.querySelector('#status').textContent==='コピーしました。');assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).length,100000);
   await page.fill('#source','あ'.repeat(100001));assert.ok(await page.locator('#copy').isDisabled());assert.equal((await page.inputValue('#source')).length,100001);assert.match(await page.locator('#status').innerText(),/長すぎます/);
   await page.fill('#source','本日\nは晴れ。');assert.equal(await page.inputValue('#result'),'本日は晴れ。');
   const d=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll('button')].map(e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height};}),areas:[...document.querySelectorAll('textarea')].map(e=>{const b=e.getBoundingClientRect();return {x:b.x,w:b.width};})}));
   assert.ok(d.scroll<=d.client+1);for(const b of d.buttons){assert.ok(b.h>=44&&b.x>=0&&b.x+b.w<=width+1);}for(const a of d.areas)assert.ok(a.x>=0&&a.x+a.w<=width+1);
   for(let i=0;i<d.buttons.length;i++)for(let j=i+1;j<d.buttons.length;j++){const a=d.buttons[i],b=d.buttons[j];assert.ok(a.x+a.w<=b.x+1||b.x+b.w<=a.x+1||a.y+a.h<=b.y+1||b.y+b.h<=a.y+1,'overlapping buttons');}
   await page.click('#reset');assert.equal(await page.inputValue('#source'),'');assert.equal(await page.inputValue('#result'),'');assert.ok(await page.locator('#copy').isDisabled());
   assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log('PASS_PDF_REAL_BROWSER',JSON.stringify({width,fixtures:cases.length,clipboard:'full-match/edit/100000 characters',originalRestoreReset:true,limits:true,layout:d,externalRequests:external.length,pageErrors:errors.length}));await context.close();
  }
  const page=await browser.newPage();await page.goto('http://127.0.0.1:8765/tools/csv-merge/');await page.click('#demo');await page.waitForFunction(()=>document.querySelectorAll('#preview tbody tr').length===4);console.log('PASS_CSV_BROWSER_REGRESSION');await page.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
