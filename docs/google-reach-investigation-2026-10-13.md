# Google取得404・サイトマップ失敗の追加調査

## 2026-10-14 13:40以降：Google到達の更新（本人報告）

sitemap.xmlは13:29JST、guideは13:34JSTのGoogle公開URLライブテスト成功。10/13 guide404は今回再現しない。**過去404の原因は未確定、再デプロイや本番修正による解消ではない。** guideは10/14に本人が登録リクエスト実行、toolは10/13にリクエスト済み、両方の実登録完了は未確認。top登録済み。サイトマップ送信レポートは「読み込めませんでした」のまま。ライブ取得成功/実インデックス/サイトマップ処理は分離する。

以前の本人ライブ再確認待ちはこの報告で終了。今日の追加の本人確認/削除再送/ログイン/権限を要求しない。次回Work時に必要な反映状態だけを判断、毎日転記にしない。RUM10/13 19:40〜10/20 19:40JSTは維持、後半に取得成功が確認された窓で検索流入不足を需要不足の証拠にしない。必要なら到達状態に合わせた別窓を後で提案し、今は日付をリセットしない。

既存Read OAuthで途中窓10/13 19:40以上〜10/14 13:40未満JST（UTC10/13 10:40〜10/14 04:40）を1queryで取得、HTTP200/errors=[]。host total count1/sum.visits1/avg.sampleInterval1、ページ別はtopだけ1/1。許可したguide/tool/privacyは未返却で0に置換しない。第三者/自己不明、広告表示/収益とは別、月次全体ではない。Google検索0/0は10/13本人表示の観測を保持、集計期間不明のまま月次0にしない。

収益の第一準備候補は既存ガイドへの限定AdSense広告。実商用採択/登録/掲載は保留。紹介はCSV関連の有料選択需要/適合案件不足、商品は購入理由不足で製作しない。新確認は所有確認metaで広告JSと審査段階を分ける方法、公式Read APIの成果/通知監査候補、表示報酬→翌月確定の経路。具体的な段階A（無料登録/確認meta/審査）、別承認段階B（guide1枠/CMP/privacy）、30日実験/停止条件を[収益記録](revenue-first-yen-2026-10-12.md)へ準備。専用reader/GPT通知運用は未実装で本人の反復操作へ代替しない。

開始main12e3d0a086d474a52d2e0c8fdb5070719f2fa4cb、Pages本番bdd91e27 success/preview none、#2〜#5 Draft/#6 mergedを再確認。変更は引き継ぎ/measurement/既存Google監査/状態/月次/収益/KPIの7文書だけ。[CF-Pages-Skip]で保存し内容/スキップ/本番不変を照合。サイトコード/公開/Google/認証/権限/Secrets/登録/契約/費用変更なし、追加支出0円。GitHub APIの文書blob作成は403、既承認の文書UI保存で代替、権限を増やさない。

次のGPT作業は10/20以降の既存窓取得と、広告の低介入閲覧/通知経路・公開前QA差分の確定。現在の本人操作：不要。新登録/契約・本番meta/広告・新OAuthは具体的な準備が揃ってから別承認。Googleサイトマップ処理/ツールとガイド登録/収益は未完了。今回の報告反映/比較/実行案の準備を完了として、保存検証後🟢作業完了とする。保存IDは当該Git履歴と最終報告で確認。

確認日：2026-10-13 20:50以降JST。開始main 10744873efcbd87456789e9e80cacd51f432807c。本番はbdd91e27e2092beb74508847f74ab8221cea2e42/success。既存Cloudflare限定Read OAuthとGitHub読取り、公開HTTPだけ。サイトコード・Pages/Google設定・権限・認証・契約・費用の変更なし。追加支出0円。#2〜#5は既存Draft未マージを維持。

## 本人のSearch Console確認（2026-10-13）

今回の根拠は本人の文面報告。別チャットのスクリーンショット/動画をこのWorkが直接監査したとはしない。

| 対象 | 本人確認結果 | 未確認/注意 |
| --- | --- | --- |
| Googleアカウント/所有権 | 復旧・所有権確認成功 | 旧停止を現行障害にしない |
| トップ | インデックス登録済み | 検索表示実績とは別 |
| /tools/csv-merge/ | 当初Google未認識、ライブ登録可能、20:44JST登録リクエスト成功 | 実登録完了は未確認。申請失敗が継続しているとは扱わない |
| /guides/csv-column-merge/ | 未認識、20:46ライブ「ページの取得404」「Googleに登録できません」 | Fennec本文表示成功も本人報告。現在のGoogle404原因未確定 |
| サイトマップ | 取得失敗、最終読み込み10/12 | 詳細理由/Google側のHTTP応答/最新再取得未確認。日付を最新失敗時刻と断定しない |
| 検索パフォーマンス | 10/13確認時表示0・クリック0 | 本人報告の表示値として記録。期間・フィルター・最終データ日未提示、全月0とはしない |

## 直接検証したこと

公開HTTPマトリクス：20:52:05〜20:52:41JST、通常UA/Googlebotモバイル/Google-InspectionToolモバイル/同デスクトップの4種×6パス=24応答。JavaScriptは実行せず、CSV/個人情報なし。各UAのバージョン文字列は検証用固定値で、実Google送信元IPや実クローラーそのものではない。全応答のCF-Ray末尾DFW、単一配信拠点の観測。CF-Cache-StatusとAgeは非提示、absenceをcache miss/無効の証明にしない。

| パス | 4UAすべての初回応答 | 本文/転送先 |
| --- | --- | --- |
| /guides/csv-column-merge/ | 200 | HTML6673bytes、タイトル/本文は正しいガイド |
| /guides/csv-column-merge | 308 | Location:/guides/csv-column-merge/ |
| /guides/csv-column-merge/index.html | 308 | Location:/guides/csv-column-merge/ |
| /sitemap.xml | 200 | application/xml、378bytes、XML正常4URL |
| /robots.txt | 200 | text/plain、74bytes、Allow:/、サイトマップ完全URL |
| /tools/csv-merge/ | 200 | HTML6924bytes |

16件200/8件308、noindex応答ヘッダーなし。各200本文SHA256は4UA間で一致。別curlでガイド200/タイトル/h1/自己canonical確認。さらにInspectionTool短縮UA+Cache-Control:no-cacheで末尾なしを追跡すると正規URL200、正規ガイド/sitemapも200・同じ本文hash。リクエストno-cacheはCDNキャッシュが必ず消えた証拠ではない。24matrix以外はcurl1と追加3論理GET（転送追跡でHTTPは4応答）。全体で29HTTP応答、反復負荷試験なし。

本文SHA256（公開）：guide 4e7077749415ef8a9903193aaf0c715e7f45ed4287900d2b2e4df5959ed34e43、sitemap 12628f282be55d8133d9ccf9401043ba34398ebce270685df3126b21fdbcf71b、robots 5b79f56cb93935afaca3afd5881c5f3a32c78ddd70dd8c2da0e4172cc5debccc、tool 1e81268ac12bb342ddca63304133c2e20cc389cd2c96f3c921d0f57a64d6ea54。

GitHub mainと本番commitのguide blob SHAは同一e65720c464bcdb7696e1141eea33255ad592e99c。公開guideはCloudflare注入のAnalytics scriptと末尾改行以外ソース本文一致を検査。トップへのフォールバックを見て成功と誤認していない。公開sitemapにguide正規URLを含み、HTTPS/host/大文字小文字/path/末尾一致、4loc一意。source sitemapとXML本文一致を確認。

Cloudflare GET project：HTTP200/errors=[]、production success/commit bdd91e27、preview none、destination_dir=site、build_command空、root_dir空、uses_functions=false、domainsはcolumns-lab.pages.devのみ。最新文書commit10744873はis_skipped=true。認証情報/解析識別子は報告に転載しない。_redirectsはGoogle確認HTML専用rewrite1件でguide/sitemapの404や転送規則なし、_headersに拒否/noindexなし。全CloudflareネットワークやGoogle元IPログは未監査。

## 判断：確定・否定できたことと仮説

- 確定：Google側でguide404という本人報告と、WorkのDFW取得200という異なる結果がある。トップ登録済みなので全サイトがGoogleから遮断という根拠はない。ツール申請は成功に更新。
- 今回再現せず：恒常的な末尾スラッシュ不具合、index.html転送ループ、guide未配置、全UA共通の404、UA文字列だけでの拒否、sitemapの構文/URLの誤り。これは他拠点/他時刻/Google送信元でも正常の証明ではない。
- 未確定の仮説：Googleテストの実要求URLの差（入力/コピーの誤差）、取得時刻または配信拠点の一時的差、Google送信元に関係する配信差。証拠がないので特定のキャッシュ、WAF、Google障害を原因と決めない。
- 共通原因：guideとsitemapが同じGoogle側配信問題かは未確定。guideの404だけでsitemapが404だったとはいえない。Search Consoleのサイトマップ最終読み込みと20:46ライブ検査は別要求/別時刻。Work側では両方200、サイトマップエラーとGoogle404を同一原因へまとめない。
- 修正：確定した本番コード/設定不具合なし。原因不明の再デプロイ、キャッシュ削除、セキュリティ緩和、URL/canonical/サイトマップ変更、新権限要求はしない。Google到達完全確認済みとも書かない。

## 最小限の次の確認（本人、既存ログインで1回まとめて）

1. URL検査で **https://columns-lab.pages.dev/guides/csv-column-merge/** をコピーして貼り付け、公開URLライブテストを1回。検査欄の完全URL、テスト日時、ページ取得成功/404を記録。以前の結果を開けるならそれを先に確認。404が続く場合、表示される範囲で「テスト済みページを表示→その他の情報→HTTPレスポンス」または該当するレスポンス詳細のステータス/本文タイトル/Cloudflare Ray-IDだけを確認（UIがない/本文不可ならその旨）。メール/所有者一覧/Cookie/認証ヘッダー/全レスポンスを共有しない。登録リクエストの再送は今回は要求しない。
2. サイトマップの行を開き、送信対象の完全URLと取得エラー詳細を確認。既に同URLの直近ライブ「ページ取得」成功が確認済みなら再テスト不要、時刻/成功を記録。未確認なら **https://columns-lab.pages.dev/sitemap.xml** を同様に1回だけライブ検査し「ページ取得」を見る。XMLはインデックス登録対象のHTMLでないので「未登録」そのものを取得失敗にしない。削除/再送信は今は不要。

判定：guide200なら時刻付きGoogleライブ取得成功として更新（登録成功とは別）、sitemapライブ成功+レポート失敗なら取得経路と処理レポートを別記録して次回反映を確認。guide404が再現し完全URL一致ならRay-ID等の応答証拠で配信側調査の必要性を判定。具体的な本番修正やCloudflare問い合わせ/追加権限が必要になった時点で対象/影響/費用/戻し方を準備して承認を求める。毎日の本人確認や再試行ループを前提にしない。

## 観測・保存・安全

RUM10/13 19:40〜10/20 19:40 JSTは変更せず継続。トップ登録を全URL到達へ一般化しない。guide障害/ツール登録待ちが残る間は7日低アクセスを需要なしとしない。修復/Google取得成功が確認された時刻を得て、必要なら別7日窓を提案するだけ。追加権限/Secrets/課金/本番変更なし。検索0値は今回の本人観測に限定、全月KPI/収益/純利益は不明。

この報告+measurement/agent-handoff/agent-status/monthly/kpiの6文書のみ保存。[CF-Pages-Skip]使用、保存後blob照合と本番/preview不変を確認。技術調査と記録完了、Google矛盾の解消は未完了。終了状態は本人の限定確認待ち。

## 公式資料

- [Cloudflare Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/)：folder indexの正規URL転送、静的配信/キャッシュ。仕様説明は当サイトのGoogle障害原因の証明ではない。
- [Google common crawlers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers)：URL検査向けGoogle-InspectionToolのUAを区別。
- [Google Sitemap report](https://support.google.com/webmasters/answer/7451001?hl=ja)：ライブ「ページ取得」、送信URL/エラー詳細、レポートと個々URLのクロールの区別。
- [URL inspection](https://support.google.com/webmasters/answer/9012289?hl=ja)：ライブとインデックス版の区別。

