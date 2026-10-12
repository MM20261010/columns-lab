// Bounded synthetic profiling. This is not a smartphone or peak-RAM benchmark.
// Run: node --expose-gc --max-old-space-size=64 tests/pipeline-profile.js
const T=require('../site/assets/csv-core.js'),v8=require('node:v8'),{performance}=require('node:perf_hooks');
const headers=n=>Array.from({length:n},(_,i)=>'column_'+i).join(',');
const narrow=(rows,cols)=>headers(cols)+'\n'+('x,'.repeat(cols-1)+'x\n').repeat(rows);
const fixtures=[
  {name:'long-cell',input:()=>['a\n"'+'x'.repeat(200000)+'"','b\nsmall'],source:true},
  {name:'short-rows',input:()=>[narrow(5000,1),narrow(5000,1)],source:true},
  {name:'business-small',input:()=>[narrow(1000,20),narrow(1000,20)],source:true},
  {name:'source-boundary-on',input:()=>[narrow(12500,19),narrow(12500,19)],source:true},
  {name:'source-boundary-off',input:()=>[narrow(12500,19),narrow(12500,19)],source:false}
];
(async()=>{
  console.log(JSON.stringify({runtime:process.version,heapLimitMiB:Math.round(v8.getHeapStatistics().heap_size_limit/1048576),scope:'sampled V8 heap/external only; verify reported limit; no browser DOM or peak RSS'}));
  for(const fixture of fixtures.filter(f=>!process.argv[2]||f.name===process.argv[2])){
    global.gc?.();const points=[],start=performance.now();let url;
    const sample=stage=>{const h=v8.getHeapStatistics();points.push({stage,ms:Math.round((performance.now()-start)*100)/100,heapMiB:Math.round(h.used_heap_size/10485.76)/100,externalMiB:Math.round(h.external_memory/10485.76)/100});};
    const files=fixture.input().map(s=>new Blob([s]));sample('files');
    const tables=[];let cells=0;
    try{
      for(let i=0;i<files.length;i++){
        const bytes=await files[i].arrayBuffer();sample('read-'+i);
        const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);sample('decode-'+i);
        const delimiter=T.detectDelimiter(text);sample('detect-'+i);
        const rows=T.parseCSV(text,delimiter,{maxCells:T.LIMITS.inputCells-cells});cells+=rows.reduce((n,r)=>n+r.length,0);
        tables.push({name:'fixture-'+i+'.csv',rows});sample('parse-'+i);
      }
      const out=T.mergeTables(tables,{source:fixture.source});sample('merge');
      const csv=T.writeCSV(out.columns,out.rows);sample('write');
      const blob=new Blob(['\uFEFF',csv],{type:'text/csv;charset=utf-8'});sample('blob');
      url=URL.createObjectURL(blob);sample('url');URL.revokeObjectURL(url);url=undefined;sample('revoke');
      console.log(JSON.stringify({fixture:fixture.name,accepted:true,rows:out.rows.length,columns:out.columns.length,characters:csv.length,blobBytes:blob.size,points}));
    }catch(error){console.log(JSON.stringify({fixture:fixture.name,accepted:false,capacityRejected:/上限/.test(error.message),points}));}
    finally{if(url)URL.revokeObjectURL(url);}
  }
})().catch(()=>{console.error('Synthetic pipeline profiling failed');process.exitCode=1;});
