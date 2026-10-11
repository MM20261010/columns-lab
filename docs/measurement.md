# 計測設定とデータの扱い

対象: https://columns-lab.pages.dev/ 。確認日: 2026-10-11。

## 現在の状態
- Cloudflare公式MCP: Account IDを明示したPagesプロジェクトGETがHTTP 200で成功。本番mainのデプロイ成功とGitHub接続を確認。
- 権限はPages Readのまま。アカウント自動選択の失敗を、明示IDでのアクセス拒否と混同しない。再認証・権限追加・書き込みは実施しない。
- Web Analytics: PagesのAnalytics設定なし、公開ツール・プライバシーの計測スクリプトなし。訪問数は未取得。
- Search Console: 所有権確認コード未発行。この運用での登録・送信・検索数取得は未実施。
- GitHub Actions PR #2: OAuthによるPages Readが成功したので代替経路としてDraftのまま保留。マージ、Secrets登録、実行、定期化は行わない。

## Cloudflare Web Analytics: 人間の操作は有効化のみ
公式手順では無料。Pages Readだけでは設定変更できないため、本人のブラウザーで次を行う。Workの管理画面ログイン403を再試行しない。

1. Cloudflareで Workers & Pages → columns-lab → Metrics → Web Analytics → Enable。
2. 有効化済みの連絡を受けたら、GPTがMCPの読み取りで設定を再確認し、GitHub経由で次回デプロイを行う。Cloudflareが次回デプロイでスクリプトを自動挿入するため、手動タグを重複追加しない。
3. 公開HTMLの static.cloudflareinsights.com/beacon.min.js を確認する。Analyticsにページ閲覧が反映されたことを確認して初めて計測稼働と記録する。有効化日と、実際の計測開始日を分ける。
4. 利用開始の変更を配信する際に site/privacy/index.html の説明と更新日を更新する。

有効化時に使う説明文案（まだ公開しない）:
「サイトの利用状況とページの表示性能を確認するため、Cloudflare Web Analyticsを利用しています。ページ閲覧等の計測用スクリプトがCloudflareへ情報を送信します。本ツールはCSV本文・列名・入力ファイル名を解析イベントに送信しません。Cloudflareのサービスについては公式のWeb Analytics説明をご確認ください。」

CSV本文・列名・入力ファイル名・エラー内容を解析イベントに送らない。現状のJavaScriptに独自イベント送信は入れない。Web AnalyticsのVisitorsを実人数・正確な再訪率と呼ばない。CSV保存成功率や売上を閲覧数から推定しない。広告ブロック等の欠測を記録する。

Pages ReadでAnalyticsの集計値まで取得できるとは扱わない。自動取得に別の読み取り権限が必要になれば、公式APIと権限を確認し、対象・用途を限定した承認を依頼する。それまでは本人が表示した月次集計値を記録できる。書き込み権限やAPIトークンは不要。

## Google Search Console: 発行済み確認コードを受け取る
1. 本人がGoogleにログインし、URLプレフィックスに https://columns-lab.pages.dev/ を追加する。pages.dev全体のDNS権限は持たないためドメイン方式は使わない。
2. HTMLファイル方式でGoogleが発行する確認ファイルを受け取る。ファイルをこの会話に添付すれば、GPTが正確な名前・本文のまま site/ 配下に登録しGitデプロイする。HTMLタグ方式なら発行されたタグをトップのheadに設置する。パスワード・認証コード・API秘密鍵は受け取らない。仮の確認コードは作らない。
3. 本番で確認ファイル・タグを配信できてから、ログイン済みSearch Consoleで「確認」を実行する。所有権の権限付与は本人が確認する。ファイル・タグは以後も保持する。
4. 「サイトマップ」で sitemap.xml を送信する。対象URLは https://columns-lab.pages.dev/sitemap.xml 。成功・取得日時・エラーを記録する。
5. トップ・ツール・ガイドをURL検査し、発見・クロール・インデックスの状態を分けて記録する。送信やリクエストはインデックス登録を保証しない。
6. 検索パフォーマンスの検索タイプ「ウェブ」で同じ期間・同じフィルターの表示回数とクリック数を記録する。最終日、反映遅延、匿名クエリ省略、集計の日付基準も残す。

## 公開サイトと検索向け設定の検証（2026-10-11）
- ブラウザー: 架空サンプル2ファイル・4行の結合、列不足の空欄補完、設定変更時の保存無効化を確認。
- ツール→ガイド→プライバシー→トップの移動、ページ表示、各ページのcanonicalを確認。プライバシーは未有効化の現状を説明している。
- ソース: 内部リンクと静的資産の参照先、canonical、404のnoindex、XMLサイトマップの4つのURLとrobots.txtのSitemap行を検証。
- robots.txt・sitemap.xmlの公開取得はブラウザー側のERR_BLOCKED_BY_CLIENT等の制限で未確認。HTTP 200やGoogleでの取得成功を記録しない。Search Console送信時に実際の取得結果を確認する。
- 前日の詳細CSV試験は docs/qa-2026-10-10.md 。今回、実機Androidを新たに試験したとは扱わない。

## 指標と月次記録
- docs/kpi.csv: 月、対象開始日・終了日、取得日、Visitors、Page views、検索表示、検索クリック、収益・追加経費・純利益、計測状態、変更、次の仮説。
- 月次Markdown: 集計元、日付基準、フィルター、計測開始日、欠測、自己テスト訪問、最終反映日を保存する。VisitorsはCloudflare画面の定義のまま記録する。
- 未計測・未確定は空欄。測定できた0だけ0。初期準備時点の収益・追加支出0円は月全体の確定値ではない。
- 純利益 = 実際の収益 - 実際の追加経費。既存ChatGPT契約は追加費用に含めない。新規支出は計上する。どちらか未確定なら純利益も空欄。
- CTR = 同期間の検索クリック数 / 検索表示回数。分母0では未算出。前月差は両月の期間・条件・欠測が比較可能な場合のみ計算する。
- 毎月5日に前月を仮締め、10日を目安に遅延分を再確認。既存の月次レビュー自動実行を使い、重複した自動化は作らない。認証や権限不足で取得できない数値は未取得と報告する。
- 一度に1つの改善仮説を選ぶ。最初はガイドへの検索表示とクリックの30日基準値を取り、インデックス未登録や欠測を改善効果と混同しない。詳しくは docs/growth-plan.md と docs/monthly-template.md 。

## 根拠
- https://developers.cloudflare.com/pages/how-to/web-analytics/
- https://support.google.com/webmasters/answer/9008080?hl=ja
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=ja
