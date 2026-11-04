// Actual JPEG files via Pillow; NOT real browser or Canvas QA.
const C=require('../../../site/tools/image-fit/core.js');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const parent=path.join(__dirname,'.qa-output');fs.mkdirSync(parent,{recursive:true});
const out=fs.mkdtempSync(path.join(parent,'run-'));
const py=path.join(__dirname,'encoder.py');
const base={minKB:0,maxKB:100,minW:0,minH:0,mode:'exact',targetW:100,targetH:100,fit:'pad',resize:true};
function python(action,args,binary=false){const r=spawnSync('python',[py,action],{input:JSON.stringify(args),maxBuffer:10*1024*1024});if(r.status!==0)throw Error(r.stderr.toString());return binary?r.stdout:JSON.parse(r.stdout.toString());}
function encode(settings,kind='bands'){return async(w,h,q)=>{
 const ops=[],ctx={fillStyle:'',fillRect(...args){ops.push({op:'fill',color:this.fillStyle,args});},drawImage(image,...args){ops.push({op:'image',args});}};
 C.draw(ctx,{width:1280,height:681},w,h,settings);
 return new Blob([python('encode',{source:kind,width:w,height:h,quality:q,ops},true)],{type:'image/jpeg'});
};}
(async()=>{
 const results=[];
 for(const fit of ['pad','crop','stretch']){
  const s=C.settings({...base,fit}),r=await C.compress(1280,681,s,encode(s));
  const p=path.join(out,fit+'.jpg');fs.writeFileSync(p,Buffer.from(await r.blob.arrayBuffer()));
  const saved=fs.readFileSync(p);const actual=C.inspect(saved.buffer.slice(saved.byteOffset,saved.byteOffset+saved.byteLength)); // Independent Pillow verification below.
  assert.equal(actual.type,'image/jpeg');
  results.push({...python('verify',{path:p,width:100,height:100,maxBytes:100000,fit}),tries:r.tries,quality:r.quality});
 }
 const s=C.settings({...base,mode:'capacity',minW:100,minH:100,maxW:500,maxH:300,resize:true});
 const r=await C.compress(1280,681,s,encode(s,'noise'));
 assert.ok(r.width>=100&&r.width<=500&&r.height>=100&&r.height<=300);
 const p=path.join(out,'range.jpg');fs.writeFileSync(p,Buffer.from(await r.blob.arrayBuffer()));results.push({...python('verify',{path:p,width:r.width,height:r.height,maxBytes:100000}),tries:r.tries,quality:r.quality});
 const impossible=C.settings({...base,maxKB:1});let failed=false;try{await C.compress(1280,681,impossible,encode(impossible,'noise'));}catch(e){assert.match(e.message,/仕上がり寸法は変更していません/);failed=true;}assert.ok(failed);
 const lower=C.settings({...base,minKB:100,maxKB:200});await assert.rejects(()=>C.compress(1280,681,lower,encode(lower)),/作れませんでした/);
 console.log(JSON.stringify({kind:'non-browser Pillow adapter',source:'synthetic 1280x681 only',outputDirectory:out,files:results,impossibleExact1KB:'rejected',unreachableMinimum100KB:'rejected'},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
