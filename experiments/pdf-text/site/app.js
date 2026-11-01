(function () {
  'use strict';
  const source = document.getElementById('source');
  const result = document.getElementById('result');
  const copy = document.getElementById('copy');
  const reset = document.getElementById('reset');
  const restore = document.getElementById('restore');
  const reformat = document.getElementById('reformat');
  const status = document.getElementById('status');
  const summary = document.getElementById('summary');
  let revision = 0;

  function formatSource() {
    revision++;
    result.value = '';
    copy.disabled = true;
    restore.disabled = source.value.length === 0;
    reformat.disabled = source.value.length === 0;
    reset.disabled = source.value.length === 0;
    summary.textContent = '';
    if (!source.value.length) {
      result.disabled = true;
      status.textContent = '文章を貼り付けると、自動で整形します。';
      return;
    }
    try {
      const formatted = PdfText.format(source.value);
      result.value = formatted.text;
      result.disabled = false;
      copy.disabled = !result.value.length;
      summary.textContent = 'つないだ改行 ' + formatted.joined + ' ／ 残した改行 ' + formatted.retained;
      status.textContent = formatted.joined
        ? '整形しました。残した改行も含め、結果を編集できます。'
        : 'はっきり判断できる折り返しはありません。原文のまま、結果を編集できます。';
    } catch (error) {
      result.disabled = true;
      restore.disabled = true;
      status.textContent = error instanceof RangeError ? error.message : '整形できませんでした。原文は残っています。';
    }
  }

  source.addEventListener('input', formatSource);
  reformat.addEventListener('click', formatSource);
  result.addEventListener('input', function () {
    revision++;
    copy.disabled = !result.value.length;
    summary.textContent = '手動で編集中（原文は変更していません）';
    status.textContent = result.value.length ? '編集した結果をコピーできます。' : '結果が空です。コピーする文章を入力してください。';
  });
  restore.addEventListener('click', function () {
    if (restore.disabled) return;
    revision++;
    result.value = source.value;
    result.disabled = false;
    copy.disabled = !result.value.length;
    summary.textContent = '原文のまま表示中';
    status.textContent = '結果を原文に戻しました。「整形し直す」で再び整形できます。';
  });
  reset.addEventListener('click', function () {
    source.value = '';
    formatSource();
    status.textContent = '原文と結果を消しました。';
    source.focus();
  });
  copy.addEventListener('click', async function () {
    if (copy.disabled || !result.value.length) return;
    const current = ++revision;
    const text = result.value;
    copy.disabled = true;
    status.textContent = 'コピーしています…';
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(text);
      if (current === revision) status.textContent = 'コピーしました。';
    } catch (_) {
      if (current === revision) {
        result.focus();
        result.select();
        status.textContent = '自動コピーが使えません。選択した結果を、端末の「コピー」でコピーしてください。';
      }
    } finally {
      if (current === revision) copy.disabled = !result.value.length;
    }
  });
  formatSource();
})();
