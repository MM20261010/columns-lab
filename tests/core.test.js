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
