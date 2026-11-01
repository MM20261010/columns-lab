# 画像サイズ合わせ：公開承認案・実施手順（2026-11-01）

## 承認対象と判断

**🟠 条件付き公開承認待ち。** 既知の重大不具合はなく、JPEGの主要操作は既存実Chrome QAで確認済み。公開用ソース/SEO/内部リンク/CSP/既存計測への適合をPR9内へ実装し、影響する全自動検査が合格した。

条件とは、狭幅320/360/390px・Android実機・修正後の原寸キー操作を候補ソースで実ブラウザ確認していないこと、ICC/HDR/モバイル大画像メモリ等の既知制限を明示した限定的な初回公開を承認すること。これを不合格としたわけではなく、今回の利用可能な検証経路の限界。Android実機未検証だけを理由に公開を禁止しない。未確認を合格へ置換しない。保証のない大容量・色厳密用途の対応拡張は行わない。

公開予定URL：**https://columns-lab.pages.dev/tools/image-fit/**  
対象PR：#9、head branch `task/image-fit-pilot-20261030`。開始head `9fa85f2b5bfe5da01ae017ee53bfa542a820497a`。最終承認対象headはこの記録を保存したGit履歴/最終報告に示す。開始main `5f03a4da55ccd8493c852b7e24596f9bc2804f9c`、既存公開 `257c7ec730634accbe545eb33984753b47ba8750`。PDFbranch `ce6a3aa58cb7810114e231de651f57b1096b8f5d` は無変更。

承認する場合の範囲は「この固定headのPR9をDraft解除→通常マージ→既存Pages自動本番反映を確認→公開後スモーク」で、外部投稿・新規登録・課金・観測タスク変更は含めない。今回これらは実施していない。人間に転記や毎回の端末検証を要求しない。

## 実装済みの公開差分

- `site/tools/image-fit/`：index.html/app.js/core.js/style.cssの4ファイル。qa/、fixtures、結果JSON、実験docsを配信先へコピーしない。
- タイトル「画像サイズ合わせ｜容量と最小ピクセルを同時に確認 | 列そろえラボ」、JPEG/静止PNGと容量上下限/最小pxを説明、h1と絶対canonical。
- 公開版はmeta index/follow、試作のnoindexヘッダーをコピーしない。実験版はnoindex/connect-src noneを維持。
- トップにツール紹介、CSVページの説明末尾に画像への導線。画像側はトップ/CSV/プライバシーへ戻れる。CSVの処理コードと共通CSSは完全保持。
- sitemapは既存4URLを保持し画像URLだけ追加して5URL。robots.txtやSearch Consoleは変更しない。
- 画像用CSSは親grid/inputの最小幅を抑え、420px以下では数値入力を1列、操作ボタンを折返し配置、ボタン高さ44px以上。その他のサイトCSSに影響させない。
- 画像ページ限定のCSPをroot `site/_headers` へ追加。既存全ページのヘッダーは維持し、既存RUMのスクリプト/送信先だけを許可。unsafe-inline/unsafe-eval/全許可は追加しない。
- プライバシー文に画像/ファイル名の端末内処理、JPEGの透明/色変化、通常配信/既存計測との分離を追記。独自の追跡/変換イベント/外部依存は追加しない。

## 計測/CSPの具体的整合

既存公開トップの実Chrome DOMで `https://static.cloudflareinsights.com/beacon.min.js` と設定属性の存在を確認。Cloudflare Pages RESTの既存build設定でもWeb Analytics設定が存在し、destination_dir=site、main自動反映、preview none、watch site/*を確認した。トークン等の設定値は文書/コードへ転記しない。GraphQLは利用していない。

公開版metaとパス限定HTTP CSPは同じ内容（HTTP側はframe-ancestors noneを追加）：
- script-src：self と https://static.cloudflareinsights.com
- connect-src：self と https://cloudflareinsights.com
- img-src：self/blob/data。form-action/object-src/base-uriはnone。

Cloudflareの既存自動注入を使い、HTMLにbeaconを二重追加しない。自作画像JS自体にはfetch/XHR/WebSocket/beacon等の送信APIがなく、ファイル名/画像のイベント送信もない。CSPで既存RUMを許すことと、自作処理から画像を送らないことを分ける。将来RUM側の仕様変更やブロッカーによる欠測は未取得として記録する。

公式根拠：https://developers.cloudflare.com/web-analytics/faq/ 、https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/ 。

候補ページでの実ビーコン送信は未配信につき未検証。既存コード/設定の存在とCSP適合を静的確認しただけで、新ページのPV返却成功とは言わない。自己QAを第三者PVに加えない。

## 検証結果と引き継いだ合格

- 既存実Chrome：EXIF1〜8、透過PNG白背景、実JPEG容量/最小寸法、実保存/同ファイル再読込、保存ファイルhashと独立デコード、条件変更後の旧保存無効化を継承。今回の変更は圧縮core/appへ影響しないため再実行していない。
- 前回9fa85f2監査のGIF拒否→サンプル復帰→リセット、デスクトップ表示は保持。今回独立して新しい合格として数えない。
- Node：`node --test experiments/image-fit/tests/*.test.js tests/*.test.js` が **48/48合格、失敗0、skip0**。内訳は画像34検査＋公開設定8検査＋既存CSV/ガイド6ファイルスイート。6スイートに含まれるガイド16項目などを重複加算しない。
- 8公開検査：index/canonical、CSPのパス制限とmeta一致、往復リンク、全local参照/fragment、sitemap、試作と公開のapp/core/CSS同一性、既存CSV/共通資産hash、プライバシー文。
- Python XML parserで名前空間/5URLを検証。
- `docs/image-fit-publication-rollback.patch` をgit apply --checkし、隔離コピーへ適用後のsite全体が変更前と完全一致することを確認。

原寸表示のEnter/Space/読み上げ名は前回34検査へ追加済みで、今回も模擬UI回帰が通過。実キー/読み上げ/320・360・390px/Android実機を確認したとは言わない。標準プレビュー基盤の不在とブラウザ転送機能なしは既存記録を継承し、無制限に再試行していない。既存本人限定QAは旧version1のまま、新しいQA配信/認証を始めていない。候補ソースを配信して実ブラウザで確認できる別経路がないため、今回は既存QA＋関連ローカル回帰を代替根拠にする。

機械記録：`experiments/image-fit/qa/PUBLICATION-PREP-2026-11-01.json`。新候補の成功画面を捏造しない。

## 残存リスク

1. 狭幅はCSSを準備/レビューしたのみで実レンダリング/タッチ/ソフトキーボード未確認。Android実機なし。初回公開で支障があれば利用制限案内/修正か停止を行う。
2. 原寸表示のキーボード追加はソース/模擬DOM合格、実ブラウザ未確認。主要なJPEG生成/保存とは別の補助操作。
3. ICC/HDR/CMYK等の色再現と端末メモリピークは未保証。対応はJPEG・静止PNG、入力15MiB・20MP・各辺12,000px。HEIC/WebP/GIF/SVG/PDFは追加しない。
4. 新ページのRUM配送/本番レスポンス/CSP実適用は公開後のスモーク対象。未確認を0PV/失敗と断定しない。
5. 検索需要/順位/実利用者獲得は未証明。検索順位やPV増を保証しない。既存の14日/11月30日の判断方針を維持し、機能数を成果にしない。

## 本人が承認した後の具体的手順（今回は未実施）

1. この記録を保存したPR headとmainが承認時の対象と同じか読み取り照合。競合/追加変更があれば差分だけ再確認・必要な回帰を行い、古い承認を別変更へ流用しない。
2. PR9のDraftを解除し、通常のmerge commitでマージする。merge messageは例 `Publish image size fitting tool` とし、**[CF-Pages-Skip]を含めない**。監査/準備コミットはスキップ付きのまま保存。子コミットのスキップ文言を含み得るデフォルトsquash本文は使わない。自動マージは設定しない。
3. 既存Pagesのmain自動反映を待ち、RESTで承認後のmerge commitがproduction success/is_skipped=false、canonical deploymentへ反映されたことを確認。勝手な設定変更/別サイト作成/再公開連打はしない。
4. 公開URLのHTTP200、タイトル/canonical/noindexなし、資産読込、RUM script/CSPエラーを確認。初回公開後は合成画像で1回の生成/保存/旧保存無効化と、可能な狭幅のスモークを実施。これは未配信だった候補/公開経路を初めて確認する必要な検証で、理由のない既存QA再実行とは区別する。
5. トップ/CSV/プライバシー/既存ガイドが維持されることを確認。自己QA日時と対象を記録し、第三者流入へ混ぜない。
6. 画像破損/保存不能/漏えい/重大なモバイル操作不能等が出たら公開継続せず、下記の承認済み停止・復旧範囲に従う。軽微な表示差/対応拡張は公開後の改善候補へ。

## 停止・復旧案

事前検証済み `docs/image-fit-publication-rollback.patch` は公開差分のsite9ファイルだけを変更前へ戻す逆差分。実験/QA/docsの成果は残す。これは保存しただけで本番へ適用していない。

承認案には、重大不具合時に「新画像ページと追加リンク/CSP/sitemap/プライバシー差分だけを取り下げる専用rollback PRを作り、本人が許可した場合にマージ・反映する」範囲を含める。本人が緊急復旧まで明示承認していない場合は、準備と報告までで停止し、無断の本番変更はしない。mainの強制resetや過去commitの丸ごと再公開で後続文書/CSV変更を巻き戻さない。

公開後にsiteが別変更を受けた場合は逆差分の適用確認をやり直す。今回のパッチ一致を将来の任意の状態へ流用しない。

## 保存と本人操作

保存先は既存PR9 branchのみ。[CF-Pages-Skip]を先頭にした準備commit、Pages skip/main・本番・PDFbranch不変を保存後に照合する。PR9はDraft/未マージを維持、既存QAサイトも更新しない。新規アカウント/課金/追加計測サービス/外部投稿/タスク変更なし。追加費用0円。

**次に本人が判断する1件は、上記リスクを明示した固定headの限定公開を承認するかどうか。** 承認前に追加の転記/実機検証を本人へ要求しない。条件を受け入れない場合は公開せず、許可された候補プレビュー環境が使える時に残りを確認する。

