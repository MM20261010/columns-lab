const assert = require('node:assert/strict');
const T = require('../site/assets/csv-core.js');
const q=(s,d=',')=>T.parseCSV(s,d);
assert.deepEqual(q('a,b\n1,2\n'),[['a','b'],['1','2']]);
assert.deepEqual(q(''),[]);
assert.deepEqual(q('\uFEFFa,b\r\n1,2'),[['a','b'],['1','2']]);
assert.deepEqual(q('a,"b,c"\r\n"x\r\ny","a""b"'),[['a','b,c'],['x\r\ny','a"b']]);
assert.deepEqual(q('a\tb\n1\t2','\t'),[['a','b'],['1','2']]);
assert.deepEqual(q('a;b\n1;2',';'),[['a','b'],['1','2']]);
assert.equal(T.detectDelimiter('a\tb\n1\t2'),'\t');
assert.equal(T.detectDelimiter('a;b\n1;2'),';');
assert.equal(T.detectDelimiter('a,b\n"c,d",e'),',');
assert.throws(()=>q('a,"b'),/引用符が閉じていません/);
assert.throws(()=>q('a,b\n"c"z,1'),/余分な文字/);
assert.throws(()=>q('a,b\n1"x,3'),/途中に引用符/);
assert.throws(()=>T.validateHeaders(['a','a']),/重複/);
assert.throws(()=>T.validateHeaders(['a',' ']),/空の列名/);
assert.deepEqual(T.validateHeaders([' 日付 ','売上']),['日付','売上']);
const tables=[{name:'one.csv',rows:q('a,b\n1,2\n')},{name:'two.csv',rows:q('b,c,a\n3,4,5\n6,7,8\n')}];
const out=T.mergeTables(tables);
assert.deepEqual(out.columns,['a','b','c','_source_file']);
assert.deepEqual(out.rows,[['1','2','','one.csv'],['5','3','4','two.csv'],['8','6','7','two.csv']]);
assert.deepEqual(out.summaries[0].missing,['c']);
assert.deepEqual(out.summaries[1].extras,['c']);
assert.equal(out.total,3);
assert.throws(()=>T.mergeTables([{name:'A',rows:q('a,b\n1,2,3')},tables[1]]),/多い項目/);
assert.throws(()=>T.mergeTables([{name:'A',rows:q('_source_file\na')},tables[1]]),/_source_file/);
assert.equal(T.sanitizeForExcel('=SUM(A1)'),"'=SUM(A1)");
assert.equal(T.sanitizeForExcel('   +1'),"'   +1");
assert.equal(T.sanitizeForExcel('123'), '123');
assert.equal(T.writeCSV(['a','b'],[['hello, world','"z"']],false),'a,b\r\n"hello, world","""z"""\r\n');
console.log('CSV core tests: passed');
// Regression: sampling must not truncate a long quoted record.
for(const delimiter of ['\t',';']){
  const text=`name${delimiter}note\nA${delimiter}"${'x'.repeat(31000)}\ncontinued"\n`;
  assert.equal(T.detectDelimiter(text),delimiter);
  assert.equal(T.parseCSV(text,delimiter)[1][1],'x'.repeat(31000)+'\ncontinued');
}
assert.equal(T.detectDelimiter('name\tnote\r\nA\t"a""b"\r\n'),'\t');

// Formula protection is a limited export mode, not a spreadsheet safety guarantee.
const hazardous=['=1+1','+1+1','-1+1','@SUM(A1)','＝1+1','＋1+1','－1+1','＠SUM(A1)',
  '\ttext','\rtext','\ntext','  \ttext','\t=1+1','\r\n=1+1','\u3000＝1+1','\u00a0+1'];
for(const value of hazardous) assert.equal(T.sanitizeForExcel(value),"'"+value);
const unchanged=['','plain','123','-123','-0','-0.25','-.5','-1.','-1e-3','-2E+4',
  'a\tb','a\r\nb','text=1','"=1+1',"'=1+1",'１２３'];
for(const value of unchanged) assert.equal(T.sanitizeForExcel(value),value);
for(const value of ['-Infinity','-NaN','--1','-1,2',' -1','-1\n'])
  assert.equal(T.sanitizeForExcel(value),"'"+value);
// CSV quoting must not introduce a new field or lose tabs, line breaks or quotes.
const values=[...hazardous,...unchanged,'x,=1+1','x;=1+1','a"b','="x",=2'];
assert.deepEqual(T.parseCSV(T.writeCSV(['header'],values.map(v=>[v]),false)).slice(1),values.map(v=>[v]));
assert.deepEqual(T.parseCSV(T.writeCSV(['＝1+1'],values.map(v=>[v]),true)),
  [["'＝1+1"],...values.map(v=>[T.sanitizeForExcel(v)])]);
// The same policy applies to headers and filename-derived values, not just input cells.
const formulaSource=T.mergeTables([
  {name:'＝1+1.csv',rows:[['=1+1'],['-123']]},
  {name:'safe.csv',rows:[['=1+1'],['a"b']]}
]);
const protectedSource=T.parseCSV(T.writeCSV(formulaSource.columns,formulaSource.rows,true));
assert.equal(protectedSource[0][0],"'=1+1");
assert.equal(protectedSource[1][0],'-123');
assert.equal(protectedSource[1][1],"'＝1+1.csv");
assert.deepEqual(T.parseCSV(T.writeCSV(formulaSource.columns,formulaSource.rows,false)),
  [formulaSource.columns,...formulaSource.rows]);
console.log('Formula/export round-trip regression tests: passed');
