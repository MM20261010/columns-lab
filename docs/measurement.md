# 計測設定とデータの扱い

対象: https://columns-lab.pages.dev/ 。2026-10-10時点では計測の有効化は未確認。

## Cloudflare Web Analytics
1. Cloudflareで Workers & Pages → columns-lab → Metrics → Web Analytics → Enable。
2. 次回Gitデプロイ後、公開HTMLに static.cloudflareinsights.com/beacon.min.js が入ることを確認。
3. AnalyticsでトップとCSVツールを訪問し、ページ別閲覧が反映されるまで待つ。
4. 実際の有効化を確認してから site/privacy/index.html の「利用する場合があります」を利用中の説明に更新する。

CSV本文・列名・ファイル名・エラー内容を解析イベントに送らない。現状のJavaScriptに独自イベント送信は入れない。Web Analyticsはページ閲覧等の計測であり、CSV保存成功率や正確な再訪率を測ったと扱わない。広告ブロックで計測されない利用もある。売上やコンバージョンを閲覧数から推定しない。

## Google Search Console
1. URLプレフィックスに https://columns-lab.pages.dev/ を追加する（pages.dev全体のDNS権限は持たない）。
2. HTMLファイル方式を使う場合、Googleの正確なファイル名・本文を site/ 配下に置きGitへ登録する。HTMLタグ方式ならGoogleが発行したタグだけをトップのheadに入れる。
3. 本番URLで確認できてからGoogleの「確認」を実行する。確認ファイル・タグは以後も削除しない。
4. 所有権確認後に sitemap.xml を送信し、トップ・ツール・ガイドのURL検査を行う。インデックス登録は保証できない。
5. 検索パフォーマンスのページ・クエリ・デバイス別データを同じ期間で記録する。反映遅延、匿名クエリ省略、日付基準の違いを記録する。

所有権確認コードは未発行。仮のコードを公開したり、確認済みと記録したりしない。

## 指標と月次記録
- docs/kpi.csv の訪問欄は、Web AnalyticsのVisitors定義のまま記録する。ページビュー等は月次Markdownにも保存する。
- 未計測・未確定の値は空欄。測定できた0のみ0。初期の収益・経費0は初期準備時点の記録で、月末確定値ではない。
- 純利益 = 実際の収益 - 実際の経費。既存ChatGPT契約は本実験の追加費用に含めない。本実験のために追加支出したら計上する。
- クリック率は同期間の検索クリック数 / 検索表示回数。分母0では未算出。
- 前月差は両月の計測期間・欠測状態が比較可能な場合のみ計算する。

## 根拠
- https://developers.cloudflare.com/pages/how-to/web-analytics/
- https://support.google.com/webmasters/answer/9008080?hl=ja
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=ja
