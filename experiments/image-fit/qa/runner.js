/* QA-only, no network/persistence. Run only on an approved QA origin. */
'use strict';
const fixtures=window.IMAGE_FIT_FIXTURES, C=window.ImageFit;
const orders=['RGBY','GRYB','YBGR','BYRG','RBGY','BRYG','YGBR','GYRB'];
const colors={R:[255,0,0],G:[0,128,0],B:[0,0,255],Y:[255,255,0]};
let saved=null, saveURL=null;
const assert=(ok,message)=>{if(!ok)throw new Error(message);};
function source(f){return new Blob([Uint8Array.from(atob(f.base64),c=>c.charCodeAt(0))],{type:f.file.endsWith('.png')?'image/png':'image/jpeg'});}
async function digest(blob){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))].map(x=>x.toString(16).padStart(2,'0')).join('');}
function canvasFor(bitmap,w=bitmap.width,h=bitmap.height){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{alpha:false});assert(ctx,'Canvas unavailable');ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(bitmap,0,0,w,h);return c;}
function encode(c,q){return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('toBlob null')),'image/jpeg',q));}
async function convert(input,s){let image;const canvases=[];try{C.inspect(await input.arrayBuffer());image=await createImageBitmap(input,{imageOrientation:'from-image'});const r=await C.compress(image.width,image.height,s,async(w,h,q)=>{const c=canvasFor(image,w,h);canvases.push(c);const b=await encode(c,q);c.width=c.height=1;return b;});const actual=C.inspect(await r.blob.arrayBuffer());assert(actual.type==='image/jpeg'&&C.fits(r.blob.size,actual.width,actual.height,s),'output condition mismatch');return {...r,actual};}finally{image?.close();canvases.forEach(c=>{c.width=c.height=1;});}}
async function pixels(blob){const b=await createImageBitmap(blob,{imageOrientation:'from-image'});const c=canvasFor(b),ctx=c.getContext('2d');const points=[[20,20],[c.width-20,20],[20,c.height-20],[c.width-20,c.height-20],[Math.floor(c.width/2),Math.floor(c.height/2)]];const values=points.map(([x,y])=>[...ctx.getImageData(x,y,1,1).data].slice(0,3));b.close();c.width=c.height=1;return values;}
function closeColor(actual,expected,tolerance=35){return actual.every((n,i)=>Math.abs(n-expected[i])<=tolerance);}
async function expectRejected(fn,pattern){let error;try{await fn();}catch(e){error=e;}assert(error,'unexpected successful output');assert(pattern.test(error.message),'unexpected rejection: '+error.message);}
document.getElementById('run').addEventListener('click',async()=>{
 const button=document.getElementById('run'),report=document.getElementById('report');button.disabled=true;saved=null;if(saveURL)URL.revokeObjectURL(saveURL);saveURL=null;document.getElementById('save').hidden=true;document.getElementById('roundtrip').textContent='保存・再読込は未検証';
 const results=[];const test=async(name,fn)=>{try{const detail=await fn();results.push({name,status:'pass',detail});}catch(e){results.push({name,status:'fail',error:e.message});}report.textContent=JSON.stringify({status:'running',results},null,2);};
 try{
  for(const f of fixtures)await test('fixture hash: '+f.file,async()=>{const b=source(f);assert(b.size===f.bytes&&await digest(b)===f.sha256,'fixture corruption');});
  const broad=C.settings({minKB:0,maxKB:200,minW:0,minH:0,resize:false});
  for(let i=1;i<=8;i++)await test('EXIF '+i+' / JPEG / color corners',async()=>{const f=fixtures.find(x=>x.file==='orientation-'+i+'.jpg'),r=await convert(source(f),broad);assert(r.width===f.expected_oriented_dimensions[0]&&r.height===f.expected_oriented_dimensions[1],'orientation dimensions');const p=await pixels(r.blob);[...orders[i-1]].forEach((code,j)=>assert(closeColor(p[j],colors[code]),'corner '+j+' orientation/color mismatch'));return {bytes:r.blob.size,width:r.width,height:r.height};});
  await test('transparent -> white JPEG / red center',async()=>{const r=await convert(source(fixtures.find(x=>x.file==='transparent.png')),broad),p=await pixels(r.blob);p.slice(0,4).forEach(x=>assert(closeColor(x,[255,255,255],8),'background not white'));assert(closeColor(p[4],[220,30,50]),'center color changed beyond tolerance');saved=r.blob;return {bytes:saved.size};});
  await test('exact byte lower/upper inclusive',async()=>{const b=source(fixtures[0]),r=await convert(b,broad),n=r.blob.size;const s={...broad,minBytes:n,maxBytes:n};const exact=await convert(b,s);assert(exact.blob.size===n,'same browser exact boundary mismatch');return {bytes:n};});
  await test('upper bound under resize pressure',async()=>{const s={...broad,maxBytes:3000,minW:400,minH:300,resize:true};try{const r=await convert(source(fixtures[0]),s);return {outcome:'fits',bytes:r.blob.size,width:r.width,height:r.height};}catch(e){assert(e.message.startsWith('この探索範囲では'),'unexpected failure: '+e.message);return {outcome:'safely refused; not counted as generation success'};}});
  await test('lower bound impossible -> refuse',()=>expectRejected(()=>convert(source(fixtures.find(x=>x.file==='transparent.png')),{...broad,minBytes:199000,maxBytes:200000}),/^この探索範囲では/));
  await test('minimum dimensions -> refuse undersized',()=>expectRejected(()=>convert(source(fixtures.find(x=>x.file==='undersized.jpg')),{...broad,minW:512,minH:512}),/^元画像が最小寸法/));
  report.textContent=JSON.stringify({status:results.every(x=>x.status==='pass')?'codec_checks_pass':'failed',at:new Date().toISOString(),userAgent:navigator.userAgent,results,manual:{product_ui:'not_verified',download_roundtrip:'not_verified',android_device:'not_verified',icc_hdr:'not_verified'}},null,2);
  if(saved){saveURL=URL.createObjectURL(saved);const a=document.getElementById('save');a.href=saveURL;a.download='synthetic-image-fit-qa.jpg';a.hidden=false;}
 }catch(e){report.textContent=JSON.stringify({status:'harness_error',error:e.message,results},null,2);}finally{button.disabled=false;}
});
document.getElementById('reload').addEventListener('change',async e=>{try{const file=e.target.files[0];assert(saved&&file,'先に試験と保存を実施してください');const expected=await digest(saved),actual=await digest(file);assert(expected===actual,'saved file SHA-256 mismatch');const im=await createImageBitmap(file);assert(im.width===800&&im.height===600,'saved dimensions mismatch');im.close();document.getElementById('roundtrip').textContent=JSON.stringify({status:'pass',sha256:actual,bytes:file.size});}catch(error){document.getElementById('roundtrip').textContent='fail: '+error.message;}});
window.addEventListener('pagehide',()=>{if(saveURL)URL.revokeObjectURL(saveURL);});
