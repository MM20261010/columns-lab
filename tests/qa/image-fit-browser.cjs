// CI application acceptance tests. Synthetic fixtures only; no production data.
const { chromium } = require('playwright');
const fs=require('node:fs'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const py='tests/qa/image-fit-raster-20261104/encoder.py';
function python(args,input){const r=spawnSync('python3',args,{input,encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout;}
python(['-c',"import importlib.util; s=importlib.util.spec_from_file_location('qa', '"+py+"');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);m.source('bands').save('qa-bands.png');m.source('noise').save('qa-noise.png')"]);
(async()=>{
 const browser=await chromium.launch({headless:true});console.log('BROWSER',browser.version());
 try{
  for(const width of [320,360,390]){
   const page=await browser.newPage({viewport:{width,height:850},acceptDownloads:true});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8765/tools/image-fit/');
   const layout=async()=>{const d=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert.ok(d.scroll<=d.client+1,JSON.stringify(d));return d;};
   await layout();
   for(const fit of ['pad','crop','stretch']){
    await page.selectOption('#mode','exact');await page.fill('#targetW','100');await page.fill('#targetH','100');await page.fill('#maxKB','100');await page.selectOption('#fit',fit);
    await page.setInputFiles('#file','qa-bands.png');await page.locator('#before').waitFor({state:'visible'});await page.check('#agree');await page.click('#run');await page.locator('#after').waitFor({state:'visible',timeout:30000});
    assert.equal(await page.locator('#download').getAttribute('href'),null);
    await page.check('#review');const dp=page.waitForEvent('download');await page.click('#download');const download=await dp;const file='test-'+width+'-'+fit+'.jpg';await download.saveAs(file);
    const checked=JSON.parse(python([py,'verify'],JSON.stringify({path:file,width:100,height:100,maxBytes:100000,fit})));
    await layout();
    const boxes=await page.locator('.actions button').evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height};}));
    for(const b of boxes){assert.ok(b.x>=0&&b.x+b.w<=width+1&&b.h>=44);}
    assert.ok(boxes[0].y+boxes[0].h<=boxes[1].y+1,'primary overlaps next row');assert.ok(boxes[1].x+boxes[1].w<=boxes[2].x+1,'secondary buttons overlap');
    await page.setInputFiles('#file',file);await page.locator('#before').waitFor({state:'visible'});await page.waitForFunction(()=>document.querySelector('#input-info').textContent.includes('100 × 100px'));
    const natural=await page.locator('#original').evaluate(async im=>{await im.decode();return [im.naturalWidth,im.naturalHeight];});assert.deepEqual(natural,[100,100]);
    console.log('PASS_REAL_JPEG',JSON.stringify({viewport:width,fit,...checked}));
   }
   await page.selectOption('#mode','capacity');await page.locator('summary').filter({hasText:'寸法の範囲を指定する'}).click();
   for(const [id,value]of Object.entries({minW:'100',minH:'100',maxW:'500',maxH:'300',maxKB:'100'}))await page.fill('#'+id,value);
   await page.setInputFiles('#file','qa-noise.png');await page.click('#run');await page.locator('#after').waitFor({state:'visible',timeout:30000});
   const info=await page.locator('#output-info').innerText();assert.match(info,/500 × 266px/);await page.check('#review');
   await page.selectOption('#mode','exact');await page.fill('#maxKB','1');await page.click('#run');await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('作れませんでした'));
   assert.equal(await page.locator('#download').getAttribute('href'),null);assert.equal(await page.locator('#after').isVisible(),false);
   await page.fill('#maxKB','100');await page.click('#run');await page.locator('#after').waitFor({state:'visible'});await page.click('#clear');assert.equal(await page.locator('#before').isVisible(),false);assert.equal(await page.locator('#download').getAttribute('href'),null);
   await layout();assert.deepEqual(errors,[]);console.log('PASS_RANGE_FAILURE_RECOVERY_LAYOUT',width,info);await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
