const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless:true});
  try {
    for (const width of [320,360,390]) {
      const page = await browser.newPage({viewport:{width,height:850},acceptDownloads:true});
      await page.goto('http://127.0.0.1:8765/tools/image-fit/');
      const dimensions = await page.evaluate(() => ({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
      assert.ok(dimensions.scroll <= dimensions.client+1, 'horizontal overflow at '+width+': '+JSON.stringify(dimensions));
      for (const fit of ['pad','crop','stretch']) {
        await page.selectOption('#mode','exact');
        await page.fill('#targetW','100'); await page.fill('#targetH','100');
        await page.fill('#maxKB','100');
        await page.selectOption('#fit',fit);
        await page.click('#sample');
        await page.locator('#before').waitFor({state:'visible'});
        await page.check('#agree');
        await page.click('#run');
        await page.locator('#after').waitFor({state:'visible',timeout:30000});
        await page.check('#review');
        const downloadPromise=page.waitForEvent('download');
        await page.click('#download');
        const download=await downloadPromise;
        const file='test-'+width+'-'+fit+'.jpg';
        await download.saveAs(file);
        const buf=fs.readFileSync(file);
        assert.ok(buf.length<=100000,'size '+file);
        const info=await page.evaluate(async bytes=>{
          const blob=new Blob([new Uint8Array(bytes)],{type:'image/jpeg'});
          const bitmap=await createImageBitmap(blob);
          const size=[bitmap.width,bitmap.height];bitmap.close();return size;
        },Array.from(buf));
        assert.deepEqual(info,[100,100],file);
        console.log('PASS',width,fit,buf.length);
        await page.uncheck('#agree');
        assert.equal(await page.locator('#download').getAttribute('aria-disabled'),'true');
      }
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});