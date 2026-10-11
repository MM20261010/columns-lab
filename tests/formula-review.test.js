// Synthetic fixtures only. No spreadsheet execution or network access.
const assert=require('node:assert/strict');
const T=require('../site/assets/csv-core.js');
let seed=0x20261011;
const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
const tokens=['a','日','😀',',',';','"',"'",'\t','\r','\n','=', '+','-','@','＝','＋','－','＠',' ','\u00a0','\u3000'];
let checks=0;
for(let i=0;i<2000;i++){
  let value='';for(let j=0,n=random(30);j<n;j++)value+=tokens[random(tokens.length)];
  const header='header_'+i;
  for(const safety of [false,true]){
    const expected=safety?T.sanitizeForExcel(value):value;
    assert.deepEqual(T.parseCSV(T.writeCSV([header],[[value]],safety)),[[header],[expected]]);
    checks++;
  }
}
for(const marker of ['=','+','-','@','＝','＋','－','＠']){
  for(const whitespace of ['', ' ', '\t', '\r\n', '\u00a0', '\u3000']){
    const value=whitespace+marker+'1+1';
    assert.equal(T.sanitizeForExcel(value),"'"+value);
    const out=T.mergeTables([{name:value+'.csv',rows:[[marker+'header'],[value]]},{name:'fixture.csv',rows:[[marker+'header'],['-123']]}]);
    const cells=T.parseCSV(T.writeCSV(out.columns,out.rows,true));
    assert.equal(cells[0][0],"'"+marker+'header');
    assert.equal(cells[1][0],"'"+value);
    assert.equal(cells[1][1],"'"+value+'.csv');
    assert.equal(cells[2][0],'-123');
  }
}
for(const number of ['-001','-000.50','-.0','-1e999','-123456789012345678901234567890']){
  assert.equal(T.sanitizeForExcel(number),number); // CSV string only; import precision is unverified.
}
for(const number of ['-1\r','-1\n','-1\r\n','-1\u2028','-1\u2029','-1\t']){
  assert.equal(T.sanitizeForExcel(number),"'"+number);
}
// These invisible prefixes are outside the current detector. Record the gap;
// this assertion does not claim their behavior is safe in Excel or Calc.
for(const prefix of ['\u200b','\u200e','\u2060'])assert.equal(T.sanitizeForExcel(prefix+'=1+1'),prefix+'=1+1');
console.log(`Formula review: ${checks} synthetic round trips and header/source/numeric cases passed`);
