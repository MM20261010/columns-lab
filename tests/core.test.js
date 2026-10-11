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

// Reject parsed-cell growth before appending the cell that exceeds the budget.
assert.deepEqual(T.parseCSV('a,b\n1,2',',',{maxCells:4}),[['a','b'],['1','2']]);
assert.throws(()=>T.parseCSV('a,b\n1,2',',',{maxCells:3}),/入力セル数/);
assert.throws(()=>T.parseCSV('a',',',{maxCells:0}),/入力セル数/);
assert.deepEqual(T.parseCSV('a\n1',',',{maxRows:2}),[['a'],['1']]);
assert.throws(()=>T.parseCSV('a\n1\n2',',',{maxRows:2}),/入力行数/);
// Estimate must account for missing columns, repeated source names, quoting,
// protection prefixes, header-only files and short rows, without changing values.
const specialTables=[{name:'=source".csv',rows:[['a','b'],['=1+1','x"y'],['short']]},
 {name:'other.csv',rows:[['c'],['\t=1+1']]}];
for(const source of [false,true])for(const skipBlank of [false,true]){
 const merged=T.mergeTables(specialTables,{source,skipBlank});
 assert.equal(merged.estimate.outputCells,(merged.total+1)*merged.columns.length);
 for(const mode of [false,true])assert.ok(T.writeCSV(merged.columns,merged.rows,mode).length<=merged.estimate.outputCharactersUpperBound);
}
// A small input can create a wide dense output. The guard runs before row maps.
const smallLimits={columns:10,outputCells:5,outputCharacters:100};
assert.throws(()=>T.mergeTables(tables,{limits:smallLimits}),/上限/);
T.checkCapacity({columns:2,outputCells:6,outputCharactersUpperBound:20},{columns:2,outputCells:6,outputCharacters:20});
for(const e of [{columns:3,outputCells:6,outputCharactersUpperBound:20},
 {columns:2,outputCells:7,outputCharactersUpperBound:20},
 {columns:2,outputCells:6,outputCharactersUpperBound:21}])
 assert.throws(()=>T.checkCapacity(e,{columns:2,outputCells:6,outputCharacters:20}),/上限/);
assert.throws(()=>T.writeCSV(['a'],[['x'.repeat(T.LIMITS.outputCharacters)]]),/出力サイズ/);
const headersOnly=T.mergeTables([{name:'A',rows:[['a']]},{name:'B',rows:[['b']]}]);
assert.equal(headersOnly.estimate.outputCells,3);
assert.throws(()=>T.checkCapacity({rows:2,columns:1,outputCells:3,outputCharactersUpperBound:10},
  {rows:1,columns:2,outputCells:10,outputCharacters:100}),/行数/);
console.log('Capacity/estimate boundary tests: passed');
