const { test } = require('node:test');
const assert = require('node:assert/strict');
const cases = require('./cases.json');
const { format, MAX_CHARS, MAX_LINES } = require('../site/core.js');

for (const fixture of cases) {
  test(fixture.id + ': fixed output and character integrity', () => {
    const result = format(fixture.input);
    assert.equal(result.text, fixture.expected);
    let offset = 0;
    let rebuilt = '';
    for (const edit of result.edits) {
      assert.match(fixture.input.slice(edit.start, edit.end), /^(?:\r\n|\n|\r)$/);
      assert.ok(edit.replacement === '' || edit.replacement === ' ');
      assert.ok(edit.start >= offset);
      rebuilt += fixture.input.slice(offset, edit.start) + edit.replacement;
      offset = edit.end;
    }
    rebuilt += fixture.input.slice(offset);
    assert.equal(rebuilt, result.text);
    assert.equal(result.joined + result.retained, (fixture.input.match(/\r\n|\r|\n/g) || []).length);
    assert.equal(format(result.text).text, result.text, 'second formatting must be stable');
  });
}
test('100,000 code units accepted unchanged', () => {
  const input = 'あ'.repeat(MAX_CHARS);
  assert.equal(format(input).text, input);
});
test('100,001 code units rejected without truncation', () => {
  const input = 'あ'.repeat(MAX_CHARS + 1);
  assert.throws(() => format(input), { code: 'TOO_LONG' });
  assert.equal(input.length, MAX_CHARS + 1);
});
test('5,000 lines accepted / 5,001 rejected', () => {
  assert.equal(format('段落。\n'.repeat(MAX_LINES - 1) + '終わり。').inputLines, MAX_LINES);
  assert.throws(() => format('\n'.repeat(MAX_LINES)), { code: 'TOO_MANY_LINES' });
});
test('non-string rejected', () => assert.throws(() => format(null), TypeError));
test('long synthetic text has fixed expected output', () => {
  const input = ('この文章は\n安全に扱います。\n\n').repeat(1500);
  const expected = ('この文章は安全に扱います。\n\n').repeat(1500);
  assert.equal(format(input).text, expected);
});
