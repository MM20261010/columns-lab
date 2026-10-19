/* Fixed fictional example only. Does not alter the CSV tool or store user data. */
(function () {
  'use strict';
  const C = window.CSVCore;
  const $ = id => document.getElementById(id);
  const run = $('example-run'), save = $('example-save'), clear = $('example-clear');
  const picker = $('example-check-file');
  const status = $('example-status'), saved = $('example-save-status'), checked = $('example-check-status');
  const table = $('example-preview');
  if (!run || !save || !clear || !picker || !status || !saved || !checked || !table) return;
  const inputs = [
    {name: '東京.csv', text: '日付,担当,金額\r\n2026-10-01,田中,100\r\n2026-10-02,佐藤,200\r\n'},
    {name: '大阪.csv', text: '金額,日付,拠点\r\n300,2026-10-03,大阪\r\n400,2026-10-04,東京\r\n'}
  ];
  let result = null, generation = 0, checkRequest = 0;
  function message(node, text, bad = false) {
    node.textContent = text;
    node.className = bad ? 'status bad' : 'status';
  }
  function reset() {
    generation++; checkRequest++; result = null;
    save.disabled = true; picker.disabled = true; picker.value = '';
    table.replaceChildren();
    message(status, '「見本を結合する」で、架空の4行を試せます。');
    message(saved, 'まだ保存していません。');
    message(checked, '保存した見本を選ぶと、内容が同じか確かめられます。');
  }
  function render(out) {
    const caption = document.createElement('caption');
    caption.textContent = '架空の見本：4行・4列。空欄は元のファイルにない項目です。';
    const head = document.createElement('thead'), body = document.createElement('tbody');
    const header = document.createElement('tr');
    for (const name of out.columns) {
      const cell = document.createElement('th'); cell.scope = 'col'; cell.textContent = name;
      header.append(cell);
    }
    head.append(header);
    for (const row of out.rows) {
      const tr = document.createElement('tr');
      for (const value of row) {
        const td = document.createElement('td'); td.textContent = value; tr.append(td);
      }
      body.append(tr);
    }
    table.replaceChildren(caption, head, body);
  }
  run.addEventListener('click', () => {
    reset();
    try {
      if (!C) throw Error('見本の処理を読み込めませんでした。ページを開き直してください。');
      result = C.mergeTables(inputs.map(x => ({name: x.name, rows: C.parseCSV(x.text)})), {source: false});
      render(result); save.disabled = false;
      message(status, '結合できました。4行・4列です。金額は100・200・300・400で、合計1,000です。');
    } catch (error) {
      result = null; save.disabled = true;
      message(status, error.message, true);
    }
  });
  save.addEventListener('click', () => {
    if (!result || save.disabled) return;
    let url;
    try {
      const text = '\uFEFF' + C.writeCSV(result.columns, result.rows, true);
      const blob = new Blob([text], {type: 'text/csv;charset=utf-8'});
      url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'columns-lab-example.csv'; document.body.append(a);
      try { a.click(); } finally { a.remove(); }
      picker.disabled = false;
      message(saved, '「columns-lab-example.csv」の保存を開始しました。保存先はブラウザーの設定で異なります。ダウンロード一覧などで確認してください。');
    } catch (_) {
      message(saved, '保存を開始できませんでした。ブラウザーの設定を確かめて、もう一度お試しください。', true);
    } finally {
      if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  });
  picker.addEventListener('change', async () => {
    const file = picker.files && picker.files[0];
    const request = ++checkRequest, version = generation;
    if (!file || !result || picker.disabled) return;
    const expected = [result.columns, ...result.rows];
    message(checked, '見本と同じ内容か確かめています。');
    try {
      if (file.size > 8192) throw Error('large');
      const data = await file.arrayBuffer();
      if (data.byteLength > 8192) throw Error('large');
      const rows = C.parseCSV(new TextDecoder('utf-8', {fatal: true}).decode(data), ',', {maxCells: 100, maxRows: 20});
      if (version !== generation || request !== checkRequest) return;
      if (JSON.stringify(rows) !== JSON.stringify(expected)) throw Error('different');
      message(checked, '選んだファイルは、この見本と同じ4行・4列です。内容を読み取れました。');
    } catch (_) {
      if (version !== generation || request !== checkRequest) return;
      message(checked, 'この見本と同じ内容は確認できませんでした。保存した「columns-lab-example.csv」を選び直してください。元のファイルは変更していません。', true);
    }
  });
  clear.addEventListener('click', reset);
  reset();
})();
