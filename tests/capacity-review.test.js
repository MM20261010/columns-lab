// Bounded synthetic fixtures only; deliberately avoids crash/stress testing.
const assert=require('node:assert/strict');
const T=require('../site/assets/csv-core.js');
let seed=0x20261011;
const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
const tokens=['a','日','😀',',',';','"','\t','\r','\n','=','-',' '];
let checks=0;
for(let i=0;i<1000;i++){
  const tables=[];
  for(let f=0;f<2+random(3);f++){
    const width=1+random(8),headers=Array.from({length:width},(_,j)=>'col_'+((j+f)%10));
    const rows=[headers];
    for(let r=0,n=random(6);r<n;r++){
      const row=[];
      for(let c=0,n=random(width+1);c<n;c++){
        let value='';for(let k=0,n=random(15);k<n;k++)value+=tokens[random(tokens.length)];
        row.push(value);
      }
      rows.push(row);
    }
    tables.push({name:`fixture_${f}\"日.csv`,rows});
  }
  const out=T.mergeTables(tables,{source:!!random(2),skipBlank:!!random(2)});
  assert.equal(out.estimate.outputCells,(out.rows.length+1)*out.columns.length);
  for(const safety of [false,true]){
    const csv=T.writeCSV(out.columns,out.rows,safety);
    assert.ok(csv.length<=out.estimate.outputCharactersUpperBound);
    const expected=[out.columns,...out.rows].map(row=>row.map(v=>safety?T.sanitizeForExcel(v):v));
    assert.deepEqual(T.parseCSV(csv),expected);
    checks++;
  }
}
for(const value of ['x'.repeat(100000),'"'.repeat(100000),'😀'.repeat(50000)]){
  const out=T.mergeTables([{name:'fixture-a.csv',rows:[['a'],[value]]},{name:'fixture-b.csv',rows:[['b'],['small']]}]);
  assert.ok(T.writeCSV(out.columns,out.rows).length<=out.estimate.outputCharactersUpperBound);
}
// Budget includes headers and blank rows, independently of blank-row filtering.
assert.throws(()=>T.parseCSV('a\n\n\n',',',{maxRows:2}),/入力行数/);
assert.throws(()=>T.parseCSV('a,b\n1,2',',',{maxCells:3}),/入力セル数/);
const base=T.mergeTables([{name:'a',rows:[['a'],['1']]},{name:'b',rows:[['b'],['2']]}]);
for(const key of ['rows','columns','outputCells','outputCharacters']){
  const field=key==='outputCharacters'?'outputCharactersUpperBound':key;
  T.checkCapacity(base.estimate,{...T.LIMITS,[key]:base.estimate[field]});
  assert.throws(()=>T.checkCapacity(base.estimate,{...T.LIMITS,[key]:base.estimate[field]-1}),/上限/);
}
console.log(`Capacity review: ${checks} bounded estimate/round-trip comparisons and boundaries passed`);
