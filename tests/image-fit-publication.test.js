const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const page='site/tools/image-fit/index.html',html=read(page);

test('publication page is indexable with one heading and exact canonical',()=>{
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.match(html,/<h1>画像サイズ合わせ<\/h1>/);
 assert.match(html,/<title>画像サイズ合わせ｜容量と最小ピクセルを同時に確認 \| 列そろえラボ<\/title>/);
 assert.match(html,/rel="canonical" href="https:\/\/columns-lab\.pages\.dev\/tools\/image-fit\/"/);
 assert.match(html,/name="description" content="[^"]+JPEG・静止PNG[^"]+"/);
 assert.doesNotMatch(html,/noindex|nofollow|未公開試作|開発中のローカル試作/);
 assert.match(read('experiments/image-fit/site/index.html'),/noindex,nofollow/);
});
test('CSP is route-scoped, matches meta, permits existing RUM without unsafe script',()=>{
 const meta=html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
 const headers=read('site/_headers');
 const rules=headers.split('\n/tools/image-fit/*\n');
 assert.equal(rules.length,2);
 assert.doesNotMatch(rules[0],/Content-Security-Policy|X-Robots-Tag/);
 assert.equal(rules[1].trim(),'Content-Security-Policy: '+meta+"; frame-ancestors 'none'");
 assert.match(meta,/script-src 'self' https:\/\/static.cloudflareinsights.com;/);
 assert.match(meta,/connect-src 'self' https:\/\/cloudflareinsights.com;/);
 assert.match(meta,/form-action 'none'/);
 assert.doesNotMatch(meta,/unsafe-inline|unsafe-eval|\*/);
 assert.doesNotMatch(headers,/noindex|nofollow/);
});
test('home and CSV link to image tool; image tool returns to home/CSV/privacy',()=>{
 for(const p of ['site/index.html','site/tools/csv-merge/index.html'])assert.match(read(p),/href="\/tools\/image-fit\/"/);
 for(const target of ['/','/tools/csv-merge/','/privacy/'])assert.ok(html.includes('href="'+target+'"'));
});
test('changed pages contain only resolving local resources and fragment links',()=>{
 for(const p of [page,'site/index.html','site/tools/csv-merge/index.html','site/privacy/index.html']){
  const text=read(p);
  for(const m of text.matchAll(/(?:href|src)="([^"]+)"/g)){
   const ref=m[1];if(ref.startsWith('https://'))continue;
   const [pathname,fragment]=ref.split('#');
   let target=pathname?path.posix.normalize(pathname.startsWith('/')?'site'+pathname:path.posix.join(path.posix.dirname(p),pathname)):p;
   if(target.endsWith('/'))target+='index.html';
   assert.ok(fs.existsSync(path.join(root,target)),p+' -> '+ref);
   if(fragment)assert.ok(read(target).includes('id="'+fragment+'"'),p+' #'+fragment);
  }
 }
});
test('sitemap contains five unique absolute canonical URLs including the image tool',()=>{
 const xml=read('site/sitemap.xml');
 assert.match(xml,/xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
 const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert.equal(urls.length,5);assert.equal(new Set(urls).size,5);
 assert.ok(urls.includes('https://columns-lab.pages.dev/tools/image-fit/'));
 assert.ok(urls.every(u=>new URL(u).origin==='https://columns-lab.pages.dev'));
 assert.match(read('site/robots.txt'),/Sitemap: https:\/\/columns-lab.pages.dev\/sitemap.xml/);
});
test('public tool uses exact tested app/core/style; no QA files in its route',()=>{
 for(const f of ['app.js','core.js','style.css'])assert.equal(read('site/tools/image-fit/'+f),read('experiments/image-fit/site/'+f));
 assert.deepEqual(fs.readdirSync(path.join(root,'site/tools/image-fit')).sort(),['app.js','core.js','index.html','style.css']);
 for(const f of ['app.js','core.js'])assert.doesNotMatch(read('site/tools/image-fit/'+f),/\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|indexedDB)\b|innerHTML/);
 const scriptSources=[...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(scriptSources,['core.js','app.js']); // Existing RUM is injected by Pages, not duplicated here.
});
test('CSV/guide processing assets and shared CSS stay byte-identical to start head',()=>{
 const expected={
 'site/assets/app.js':'91b3effb1a93b477aa69c6d702a53475d3e75f18f2e9e60dc4262b26e2497fa3',
 'site/assets/csv-core.js':'20dc179103c08f9d71dc358d49e15e9c521d4a3ed5b300687a7edf50724d9a5c',
 'site/assets/site.css':'76e30ed0e65e71f157862836bb2af243c8aacefb05210c197eb64b7ebc2d318d',
 'site/assets/guide-example.js':'e763233f2506e7f34a490db6d360ef56db164ee06a9aae295bcca18da18222c4',
 'site/assets/guide-example.css':'33b148d0279268e552a17fc99451053f0e1b5aac9d331faf0a4d85dc6103fad1',
 'site/guides/csv-column-merge/index.html':'b3e34229a9ff7158e9f7274a765b271db762d8068c2653d373bbcc6243b3d9b4'};
 for(const [p,hash]of Object.entries(expected))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex'),hash,p);
});
test('privacy notice separates page measurement from image/name content and warns about conversion',()=>{
 const p=read('site/privacy/index.html');
 assert.match(p,/画像の内容・ファイル名を外部送信せず/);
 assert.match(p,/CSV本文・列名・入力ファイル名・画像内容を解析イベントに送信しません/);
 assert.match(p,/透明部分が白になり、色や画質が変わる場合/);
 assert.match(html,/画像・ファイル名は解析イベントに含めません/);
});
