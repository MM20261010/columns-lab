// State tests with a minimal DOM double. These do not exercise a real browser,
// rendering, permissions, native clipboard, or Android.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const core = require('../site/core.js');
const code = fs.readFileSync(require.resolve('../site/app.js'), 'utf8');

function harness(writeText = async () => {}) {
  const elements = {};
  for (const id of ['source', 'result', 'copy', 'reset', 'restore', 'reformat', 'status', 'summary']) {
    elements[id] = { value: '', textContent: '', disabled: false, selected: false, focused: false,
      events: {}, addEventListener(name, callback) { this.events[name] = callback; },
      focus() { this.focused = true; }, select() { this.selected = true; } };
  }
  const navigator = { clipboard: { writeText } };
  vm.runInNewContext(code, { document: { getElementById: id => elements[id] }, navigator, PdfText: core, RangeError });
  const fire = (id, event) => elements[id].events[event]();
  const input = (id, value) => { elements[id].value = value; return fire(id, 'input'); };
  return { elements, fire, input, navigator };
}

test('empty input disables output/copy and reset', () => {
  const { elements: e } = harness();
  assert.ok(e.result.disabled && e.copy.disabled && e.reset.disabled);
  assert.equal(e.result.value, '');
});
test('paste autoformats without changing source; copy passes exact result', async () => {
  let copied;
  const { elements: e, input, fire } = harness(async value => { copied = value; });
  input('source', '本日\nは晴れ。');
  assert.equal(e.source.value, '本日\nは晴れ。');
  assert.equal(e.result.value, '本日は晴れ。');
  assert.equal(e.copy.disabled, false);
  await fire('copy', 'click');
  assert.equal(copied, '本日は晴れ。');
  assert.equal(e.status.textContent, 'コピーしました。');
});
test('manual edit keeps source; restore and reformat are distinct', () => {
  const { elements: e, input, fire } = harness();
  input('source', '本日\nは晴れ。');
  input('result', '手直ししました。');
  assert.equal(e.source.value, '本日\nは晴れ。');
  assert.match(e.summary.textContent, /手動/);
  fire('restore', 'click');
  assert.equal(e.result.value, e.source.value);
  fire('reformat', 'click');
  assert.equal(e.result.value, '本日は晴れ。');
});
test('editing result to empty disables copying', () => {
  const { elements: e, input } = harness();
  input('source', '本日\nは晴れ。');
  input('result', '');
  assert.equal(e.copy.disabled, true);
});
test('source edits replace stale manual result immediately', () => {
  const { elements: e, input } = harness();
  input('source', '本日\nは晴れ。');
  input('result', '旧結果');
  input('source', '新しい文章。');
  assert.equal(e.result.value, '新しい文章。');
  assert.doesNotMatch(e.status.textContent, /コピーしました/);
});
test('reset clears both fields and all prior result state', () => {
  const { elements: e, input, fire } = harness();
  input('source', '本日\nは晴れ。');
  input('result', '編集');
  fire('reset', 'click');
  assert.equal(e.source.value, '');
  assert.equal(e.result.value, '');
  assert.equal(e.summary.textContent, '');
  assert.ok(e.copy.disabled && e.result.disabled && e.restore.disabled && e.reset.disabled);
  assert.ok(e.source.focused);
});
test('over-limit original retained; prior output/copy invalidated', () => {
  const { elements: e, input } = harness();
  input('source', '本日\nは晴れ。');
  const large = 'あ'.repeat(100001);
  input('source', large);
  assert.equal(e.source.value, large);
  assert.equal(e.result.value, '');
  assert.ok(e.copy.disabled && e.restore.disabled && e.result.disabled);
  assert.match(e.status.textContent, /10万文字/);
});
test('clipboard rejection selects result and never reports success', async () => {
  const { elements: e, input, fire } = harness(async () => { throw new Error('denied'); });
  input('source', '本日\nは晴れ。');
  await fire('copy', 'click');
  assert.ok(e.result.selected && e.result.focused);
  assert.match(e.status.textContent, /自動コピーが使えません/);
  assert.equal(e.copy.disabled, false);
});
test('missing clipboard API gives manual copy route', async () => {
  const { elements: e, input, fire, navigator } = harness();
  navigator.clipboard = undefined;
  input('source', '本日\nは晴れ。');
  await fire('copy', 'click');
  assert.match(e.status.textContent, /端末の「コピー」/);
});
test('reset while clipboard pending cannot restore stale success or enable copy', async () => {
  let release;
  const { elements: e, input, fire } = harness(() => new Promise(resolve => { release = resolve; }));
  input('source', '本日\nは晴れ。');
  const copying = fire('copy', 'click');
  fire('reset', 'click');
  release();
  await copying;
  assert.equal(e.status.textContent, '原文と結果を消しました。');
  assert.ok(e.copy.disabled);
});
test('edit during pending clipboard keeps new result state', async () => {
  let release;
  const { elements: e, input, fire } = harness(() => new Promise(resolve => { release = resolve; }));
  input('source', '本日\nは晴れ。');
  const copying = fire('copy', 'click');
  input('result', '新しい結果');
  release();
  await copying;
  assert.equal(e.result.value, '新しい結果');
  assert.doesNotMatch(e.status.textContent, /コピーしました/);
  assert.equal(e.copy.disabled, false);
});
