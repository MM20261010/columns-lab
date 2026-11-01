const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../site/core.js');
const s=(x={})=>C.settings({minKB:0,maxKB:200,minW:0,minH:0,resize:false,...x});
function jpeg(w,h){return Uint8Array.from([255,216,255,192,0,11,8,h>>8,h&255,w>>8,w&255,1,1,17,0,255,217]).buffer;}
function png(w,h,animated=false){const b=new Uint8Array(animated?65:45),v=new DataView(b.buffer);b.set([137,80,78,71,13,10,26,10]);v.setUint32(8,13);b.set(Buffer.from('IHDR'),12);v.setUint32(16,w);v.setUint32(20,h);if(animated){v.setUint32(33,8);b.set(Buffer.from('acTL'),37);b.set(Buffer.from('IEND'),57);}else b.set(Buffer.from('IEND'),37);return b.buffer;}
test('decimal KB bounds use conservative integer rounding',()=>{assert.equal(s({maxKB:1.0019}).maxBytes,1001);assert.equal(s({minKB:.0019}).minBytes,2);});
test('invalid ranges and nonfinite values fail',()=>{for(const x of [{maxKB:0},{maxKB:15001},{minKB:201},{minKB:-1},{maxKB:'x'},{minW:.5},{minH:12001},{minW:-1}])assert.throws(()=>s(x));});
test('exact byte and dimension boundaries are inclusive',()=>{const x=s({minKB:100,minW:600,minH:400});assert.equal(C.fits(100000,600,400,x),true);assert.equal(C.fits(200000,600,400,x),true);for(const a of [[99999,600,400],[200001,600,400],[150000,599,400],[150000,600,399]])assert.equal(C.fits(...a,x),false);});
test('JPEG SOF dimensions are read regardless of file extension',()=>assert.deepEqual(C.inspect(jpeg(1200,800)),{type:'image/jpeg',width:1200,height:800}));
test('PNG dimensions and end are required',()=>{assert.equal(C.inspect(png(640,480)).width,640);assert.throws(()=>C.inspect(png(640,480).slice(0,35)));});
test('APNG rejected before decode',()=>assert.throws(()=>C.inspect(png(300,400,true)),/アニメーション/));
test('unsupported and spoofed files fail',()=>{for(const t of ['<svg/>','GIF89a','RIFFxxxxWEBP','%PDF'])assert.throws(()=>C.inspect(Uint8Array.from(Buffer.from(t)).buffer));assert.throws(()=>C.inspect(new Uint8Array([255,216,255,224,255,255]).buffer));});
test('decompression dimensions and byte caps checked before decode',()=>{assert.throws(()=>C.inspect(png(5000,5000)));assert.throws(()=>C.inspect(jpeg(12001,10)));assert.throws(()=>C.inspect(new ArrayBuffer(C.MAX_BYTES+1)));});
test('no resize by default',()=>assert.deepEqual(C.dimensions(1200,800,s()),[{width:1200,height:800}]));
test('cannot upscale an undersized original',()=>assert.throws(()=>C.dimensions(400,300,s({minW:600,resize:true}))));
test('resize plans respect every minimum, maximum, ratio rounding, termination',()=>{for(let w=100;w<2000;w+=137){const h=Math.floor(w*.7),x=s({resize:true,minW:80,minH:60}),ds=C.dimensions(w,h,x);assert.ok(ds.length<40);for(const d of ds){assert.ok(d.width>=80&&d.height>=60&&d.width<=w&&d.height<=h);assert.ok(Math.abs(d.width/d.height-w/h)<.05);}}});
test('encoder search continues after size below lower bound',async()=>{let calls=0;const r=await C.compress(800,600,s({minKB:100}),async()=>new Blob([new Uint8Array(++calls===1?99999:150000)],{type:'image/jpeg'}));assert.equal(r.blob.size,150000);assert.equal(r.tries,2);});
test('failure never returns an over-limit result',async()=>{await assert.rejects(()=>C.compress(800,600,s(),async()=>new Blob([new Uint8Array(200001)],{type:'image/jpeg'})),/作れませんでした/);});
test('minimum file size is not padded',async()=>{await assert.rejects(()=>C.compress(800,600,s({minKB:100}),async()=>new Blob(['abc'],{type:'image/jpeg'})),/作れませんでした/);});
test('resizing only happens with opt in',async()=>{const seen=[];const r=await C.compress(800,600,s({maxKB:1,minW:400,minH:300,resize:true}),async(w,h)=>{seen.push([w,h]);return new Blob([new Uint8Array(w>500?1001:999)],{type:'image/jpeg'});});assert.ok(r.width<=500&&r.width>=400&&r.height>=300);assert.equal(seen[0][0],800);});
test('null or wrong-format encoders cannot create a saved result',async()=>{for(const b of [null,new Blob(['abc'],{type:'image/png'}),new Blob([],{type:'image/jpeg'})])await assert.rejects(()=>C.compress(800,600,s(),async()=>b),/書き出せません/);});
test('cancellation while encoding discards a late result',async()=>{const c=new AbortController();await assert.rejects(()=>C.compress(800,600,s(),async()=>{c.abort();return new Blob(['a'],{type:'image/jpeg'});},c.signal),/中止/);});
test('trial count is bounded even for unachievable targets',async()=>{let tries=0;const x=s({maxKB:1,resize:true});await assert.rejects(()=>C.compress(12000,1000,x,async()=>{tries++;return new Blob([new Uint8Array(1001)],{type:'image/jpeg'});}));assert.equal(tries,C.dimensions(12000,1000,x).length*9);assert.ok(tries<360);});
