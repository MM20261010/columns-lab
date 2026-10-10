# 列そろえラボ (Columns Lab)

日本語向け・無料のCSV実務ツール。公開URL: https://columns-lab.pages.dev/

CSV本文は端末のブラウザー内で処理し、外部サーバーへ送信しません。広告・有料版は設置していません。

## 機能
- 列名で複数CSVの行を連結し、不足・追加の列を表示
- UTF-8 / Shift_JIS読込、CSV / TSV / セミコロン区切り
- 引用符内の改行・カンマ・二重引用符
- UTF-8書出し（BOM有無）、任意のExcel数式対策、元ファイル名追加
- 各ファイル10MB・合計25MBまで

列名は前後の空白だけを除き完全一致で照合。重複除去・キーでの横結合・Shift_JIS書出しは行いません。

## 検証
```sh
node tests/core.test.js
node tests/app.test.js
```

## デプロイ
GitHub main → Cloudflare Pages。FrameworkはNone、build commandは空欄、output directoryは `site`。

v0.3: 長い引用符付きTSVの区切り判定、設定変更後の古い結果の保存を修正。canonical・サイトマップ・404・CSV事例ガイドを追加。

## 運用
- 計測設定と指標定義: [docs/measurement.md](docs/measurement.md)
- 検索流入の改善計画: [docs/growth-plan.md](docs/growth-plan.md)
- 月次レビュー: [docs/monthly-template.md](docs/monthly-template.md)
- 月次数値: [docs/kpi.csv](docs/kpi.csv)
- 初月途中経過: [docs/monthly-2026-10.md](docs/monthly-2026-10.md)
- 公開後検証: [docs/qa-2026-10-10.md](docs/qa-2026-10-10.md)

初期費用0円・長期改善優先。未取得データは0で埋めません。Web Analytics有効化とSearch Console所有権確認は、実施・確認してから完了として記録します。
