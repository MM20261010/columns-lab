# 計測設定とGoogle検索到達の現状

対象：https://columns-lab.pages.dev/ 。現行確認：2026-10-13 20:06以降JST。開始main5f0a3f6835404d0a0983d3ccc9d37f485b41a2ed。この記録は旧アカウント停止/Pages ReadだけでRUM未取得という記述を更新する。収益は正当な確定報酬が初期成果、出金・銀行着金は別。未取得のKPIを0にしない。

## 状態を混同しない

| 項目 | 現在の確認結果 | 根拠と限界 |
| --- | --- | --- |
| Googleアカウント | 再審査通過、停止は現行障害でない | 本人報告。今回ログイン/アカウント操作なし |
| Search Console所有権 | 同アカウントで確認成功 | 本人報告。確認ファイルは保持。新プロパティ/別アカウントなし |
| 本番のサイトマップ | HTTP200、XML構文成功、4正規URL一致 | WorkのHTTP読取り。Google側の処理成功とは別 |
| Googleのサイトマップ取得 | 以前のエラーが継続/解消したか不明 | 現Search Consoleの最終取得時刻/詳細未取得 |
| クロール可否（公開設定） | robots許可、noindexなし、主要4ページ200・転送なし | 公開HTTP/HTML/ローカルparser確認。Google IPからの実取得は未検証 |
| Google側の実クロール | 公開ライブテスト成功/クロール許可は本人報告済み | 以前の結果。現在のindexed URL検査結果とは別 |
| インデックス | 現在未確認 | ライブ取得成功や200で登録済みとはしない |
| 登録リクエスト | 以前の一時的送信失敗を本人報告 | 現在の再送成功/再失敗の記録なし。失敗継続と断定しない |
| 検索表示/クリック | 不明 | Search Consoleのウェブ実績未取得。RUMから推定しない |
| Cloudflare RUM | 既存限定Read OAuthでHTTP200/errors=[]の集計成功 | 10/11〜10/13の限定実測は状態JSON/当月参照。旧認可失敗より新成功が優先 |

## 今回の公開HTTP・内容検証

HTTPクライアントでGET。通常UA Mozilla/5.0の6URLと、GooglebotというUAのrobots/sitemap/topの3URL、計9応答すべて200で最終URLが要求URLと同じ。bodyの同一性も確認。これはUAを指定したHTTP検査で、Googlebotの送信元IP/逆DNSを検証したアクセスではない。WorkブラウザーでページJSは実行していない。

| URL | HTTP/転送 | 公開内容 |
| --- | --- | --- |
| /robots.txt | 200/なし | text/plain; charset=utf-8。User-agent:*、Allow:/、Sitemap:https://columns-lab.pages.dev/sitemap.xml |
| /sitemap.xml | 200/なし | application/xml。urlset名前空間正しい、loc4件一意、下記4URL |
| / | 200/なし | canonicalが自URL1つ、robots/googlebot metaなし |
| /tools/csv-merge/ | 200/なし | canonicalが自URL1つ、robots/googlebot metaなし |
| /guides/csv-column-merge/ | 200/なし | canonicalが自URL1つ、robots/googlebot metaなし |
| /privacy/ | 200/なし | canonicalが自URL1つ、robots/googlebot metaなし |

全9応答にX-Robots-Tagなし。4ページはrobots parserでGooglebot許可、サイトマップloc/公開URL/canonicalが完全一致。先頭HTTP200だけでなく各URLのstatus/final URL/content-type/bodyを検査。Googlebot UA3応答は通常UAと本文同一。取得観測は2026-10-13 20:07前後JST、1地点/1時点の範囲。

GitHub最新mainのsite/_headersにnoindex/認証はなく、site/_redirectsはGoogle確認HTMLの専用200 rewriteのみ。確認ファイルの公開識別子は秘密情報ではないが、新規発行/削除しない。robots/sitemapのGit内容は公開本文と一致。本番bdd91e27e2092beb74508847f74ab8221cea2e42 success/preview noneをCloudflare読取りで確認。Pages Readからpages.dev全体のWAF/Access/全セキュリティ設定・Googlebotログを監査できたとは報告しない。

今回、設定の明白なクロール妨害やXML修正の必要は見つからなかった。Search Console取得エラーの解消は未確認なので修正/再デプロイを行わない。HTTP結果の再現は各URLへGETしstatus/final URL/X-Robots-Tag/HTML metaとcanonical/XMLを確認する。未知の403等が出たら現在の応答と取得経路を記録し、既存のセキュリティを緩めない。

## Search Console直接読み取りの限界

このWorkのツールにSearch Consoleのサイトマップ/URL検査/検索実績readerは見つからない。明示依頼の対象プロパティを既存ブラウザーセッションで一度開くと https://search.google.com/search-console/about へ転送、開始/ログイン案内のみ。プロパティのレポートは未表示。ログイン開始・Google接続/OAuth・権限追加・認証回避・アカウント変更はしない。

この未ログイン状態はGoogleアカウント停止やプロパティ削除の証拠ではない。現在のGoogle検索到達/検索実績を測定できる状態かは**判定保留**。公開側の取得成功と、Google自身の認識・表示を分ける。

## 本人に必要な1回の確認（既存ログイン環境で）

プロパティを https://columns-lab.pages.dev/ のURLプレフィックスに合わせ、以下3箇所を一度まとめて確認。表示だけなら送信/設定変更は不要。メールアドレス、所有者一覧、認証情報を共有せず、対象の状態・日時・数値だけでよい。毎日の操作・転記は求めない。

1. **インデックス登録→サイトマップ**：対象行の完全URL、ステータス、最終読み込み日時、検出URL数。エラーなら行を開き、エラー名/詳細を確認。対象は https://columns-lab.pages.dev/sitemap.xml。成功なら取得エラー解消として記録、登録済みURL数とは混同しない。失敗なら日時/具体原因をGPTへ渡し、根拠なしの再送/削除はしない。
2. **上部URL検査→トップ https://columns-lab.pages.dev/**：Googleに登録済みか、未登録なら理由、ページ取得、最終クロール、クロール/インデックス許可、Google選択canonicalを確認。既に登録済みなら登録リクエスト再送不要。未登録時のライブテスト成功は登録済みの証拠ではない。ツール/ガイドも必要に応じ同様に確認。以前の申請送信失敗が今も継続するかは、以前の記憶/未登録だけでは判断できない。今回GPTは送信しない。再申請は本人が必要性を判断して1回実施する場合に成功/失敗文言・日時を記録し、連続再試行しない。
3. **検索パフォーマンス（又は検索結果）→検索タイプ：ウェブ、期間：過去28日、他フィルターなし**：表示回数・クリック数・最新反映日・レポートの日時基準/データなし文言を確認。データなしと実測0を区別。Search Consoleの日付/遅延をJSTのRUM窓へ勝手に揃えない。

この1回の本人確認の代わりにWorkのGoogleログインや新しい読取り接続を望む場合は別の明示承認が必要。今回は接続/権限の要求も開始しない。検索実績がなくても登録直後/反映待ちの可能性があり、サイトがGoogleに拒否されたとは断定しない。

## 観測実験の扱い

RUMの期間10/13 19:40〜10/20 19:40 JSTは維持する。ただし今回はGoogle検索への到達が未確認のため、この窓を需要不足の判定に使わない。クロール/インデックスの障害が判明した場合は解消優先、解消後の確認時刻を別記録し、そこから7日間の検索到達観測を再設定する案を提案する。今は実際の障害も解消時刻も未確定なので日付を自動変更しない。

RUMは実人数/CSV処理成功/広告収益ではない。静的HTTP監査はRUM JSを実行しなかったが、検索・監視・本人アクセスの影響は従来どおり不明。GSC表示/クリックをRUMのVisitsから算出しない。本人の一回の表示確認待ちを、観測成功や検索到達確認済みに置き換えない。

## 継続・承認境界

- 月次KPI未取得数値は空欄/null。取得日・期間・指標・フィルター・反映遅延・本人報告/直接取得を別記録。
- CSV本文/列名/入力ファイル名・支援者情報を解析/ログ/GitHubへ送らない。新イベント/広告/Secretsは別承認。
- #2〜#5 Draft未マージ、#6承認済公開維持。サイトコード/公開設定/Google操作/認証/権限/契約/課金に変更なし。今回追加支出0円。
- 今回修正するのは計測・引き継ぎ文書とKPIの古いアカウント停止表示のみ。技術的な本番修正なし。保存後は文書一致/[CF-Pages-Skip]/本番不変を確認。

## 公式の判断根拠

- [サイトマップレポート](https://support.google.com/webmasters/answer/7451001?hl=ja)：詳細・最終取得を確認。Google側ライブ取得成功と送信/処理/URL登録は別。
- [URL検査](https://support.google.com/webmasters/answer/9012289?hl=ja)：インデックス版とライブテストを区別し、ライブ成功で登録を保証しない。
- [Googleクローラーの検証](https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests?hl=ja)：UA名だけで実Googleリクエストと判断しない。
- [Cloudflare指標](https://developers.cloudflare.com/web-analytics/data-metrics/high-level-metrics/)：Visitsと人間/uniqueを混同しない。
