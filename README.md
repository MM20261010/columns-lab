# 列そろえラボ (Columns Lab)

日本語向け・無償のCSV実務ツール実験。2026-10-10 時点の初回公開候補 (v0.2)。CSV本文はブラウザー内で処理し、アップロードしません。

## 機能
- CSVを列名で統合、CSV間の不足列を表示
- UTF-8 / Shift_JIS 読み取り、CSV/TSV/セミコロン区切り
- 引用符、項目内改行、二重引用符に対応
- CSV書き出し、BOM有無、数式として解釈される値に対する任意の簡易保護
- ファイル名の出典記録

## テスト
```
node tests/core.test.js
```

## GitHub → Cloudflare Pages で公開する（推奨）
1. GitHubで新規リポジトリを作り、このフォルダの内容をアップロード。公開リポジトリで問題ありません（ユーザーデータや鍵は入れていません）。
2. Cloudflareの `Workers & Pages` から新規 Pages プロジェクト → `GitHubリポジトリを接続`。
3. デプロイの設定は **framework: None**, **build command: なし**, **output directory: `site`**。
4. デプロイして `*.pages.dev` の公開URLが開くか確認。URLの実在を確認するまではサイトマップ等は設定しない。
5. Cloudflare `Metrics > Web Analytics > Enable` を有効化し、次回デプロイで解析コードが挿入されたことを確認。これに合わせてサイトのプライバシー文面も更新する。
6. Google Search Consoleでサイトの所有権を検証し検索表示回数とクリックを記録する。

注: Cloudflare Pagesは2026年時点でGit接続とDirect Uploadを同一プロジェクトで後から切り替えられない。継続改善ならGit連携から始める。

## 初回公開までの残課題
- 実ブラウザーの操作で試験する (特にAndroidのブラウザー)
- 公開後に公開URL、サーバー応答、スマホ表示、Privacy更新を確認する
- 利用規約・プライバシー表示は実際に導入した解析/広告サービスに合わせる
- 問い合わせ先や運営者表記は将来の収益化・サービス内容に応じて整備する

## 狙い
広告や有料版を急がず、検索流入とリピート利用の兆候を調べる。競合が多い「一般的なCSV結合」としてではなく、列不一致の発見と安全な統合に価値を寄せて評価。実証できなければ分野ごと転換する。

## 公開後の運用 (v0.3)
公開URL: https://columns-lab.pages.dev/ 。mainへの変更はCloudflare PagesのGit接続で再デプロイする。

- 計測手順: docs/measurement.md
- 検索改善: docs/growth-plan.md
- 月次レビュー: docs/monthly-template.md / docs/kpi.csv
- 検証記録: docs/qa-2026-10-10.md

計測設定は手順書の作成と実際の有効化を分けて記録する。
