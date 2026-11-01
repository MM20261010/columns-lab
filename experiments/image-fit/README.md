## 2026-11-01：画像サイズ合わせ公開準備完了（条件付き公開承認待ち）

開始PR9 head9fa85f2b5bfe5da01ae017ee53bfa542a820497a。既存codec/実保存/再読込QAを再利用し、主要画像処理core/appは無変更。公開用 `site/tools/image-fit/` 4ファイル、トップ/CSVの往復導線、プライバシー画像説明、5URL sitemap、画像パス限定CSPをPR9に実装。予定URL https://columns-lab.pages.dev/tools/image-fit/ 。公開版index/canonicalを設定し、実験版のnoindex/connect-src noneは維持。既存Cloudflare RUMの自動注入のみを使い、独自追跡/画像・ファイル名イベントなし。

画像CSSだけ狭幅入力1列/44px操作領域/grid最小幅対策/折返しを追加。共通CSS/CSV処理/ガイド資産はhash不変。Node48単位すべて合格（画像34＋公開設定8＋既存CSV/ガイド6ファイルスイート）、ガイド内16項目を重複加算しない。XML parser5URL合格。公開site9ファイルだけの逆差分を作成しgit apply --check＋隔離適用で変更前site完全一致。

今回実Chromeで既存公開トップのCloudflare beacon注入と設定属性を確認（1363×936、画像候補を開いたわけではない）。新候補の実キー/狭幅320・360・390px/Android/読み上げ/実RUM配送は未検証。既存private QA version1を無断更新せず、標準preview再試行/新ホスト/認証なし。原寸キー操作は模擬UI合格で、実ブラウザ成功とはしない。

判断は **🟠 条件付き公開承認待ち**。主要操作は既存実Chrome QA＋同一core/app、影響する自動検査は全合格、公開設定実装済み、重大既知不具合なし。Android未検証だけを無条件禁止理由にせず、軽微なUI/環境制限を明示した限定公開の判断へ進む。本人が条件を受け入れない場合は未公開維持。

具体的な承認範囲/公開手順/残存リスク/停止復旧は docs/image-fit-publication-ready-2026-11-01.md。結果は experiments/image-fit/qa/PUBLICATION-PREP-2026-11-01.json。逆差分は docs/image-fit-publication-rollback.patch（保存のみ）。承認後は固定head/base照合→Draft解除→スキップなし通常merge commit→Pages本番success照合→合成スモーク。緊急復旧の本番適用も別途明示承認が必要。

今回PR9内保存だけ。main5f03a4d/公開257c7ec/PDFbranchce6a3aa/Cloudflare設定/既存QA配信/観測タスクは無変更。GraphQLなし、追加費用0円。保存後に差分/内容一致/Pages skipを確認し最終headを報告する。本人への反復確認は不要、次は限定公開の承認1件。

---

## 2026-11-01：画像サイズ合わせ公開前最終監査（公開保留）

開始PR9 head fc479efe14f80a71d4e1b5a60b2c30baf2e87a15、Draft/未マージ。前回実Chrome JPEG生成/EXIF/透過/容量/実保存/再読込の証拠を再利用。b2480a59〜fc479efeは文書/結果更新のみで製品ソース不変をcompare確認。JPEG生成・保存・再読込を繰返していない。

既存本人限定HTTPS QA（version1/owner/custom/外部訪問者0）へ認証をやり直さず到達。2026-11-01 18:20 JST、実Chrome desktop1363×936。合成PNGサンプル読込のみ、非対応GIFの拒否→サンプル復帰→リセットを実確認。デスクトップ幅では横はみ出しなし。consoleの取得範囲にアプリ由来エラーはなく、拡張起源エラーは製品へ帰属しない。実通信/狭幅/Android実機は未検証。

原寸プレビューの画像がクリック専用でキーボード不可と確認。PR9内でrole/button/tabindex/説明名とEnter/Spaceを最小追加。圧縮コア/保存制約/CSS/試作CSPは不変。Node回帰は34合格（core18/privacy3/模擬UI13、従来31＋追加3）、失敗0。修正版をQA hostへ配信していないため、修正後の実キー操作は未検証。既存のcodec23と34回帰は別種類で合算しない。

判断：**公開保留**。重大な画像破損/誤保存/漏えい/CSV破壊の確定阻止不具合はなし。ただし狭幅/修正後実ブラウザ受入、公開ルート・noindex/canonical/内部リンク/sitemap、RUMとCSP整合が未完。試作そのままの本番転用不可。需要未証明のまま追加機能を増やさない。詳細 docs/image-fit-final-audit-2026-11-01.md、機械記録 experiments/image-fit/qa/FINAL-AUDIT-2026-11-01.json。

次のWork1件：許可された修正版プレビューで原寸表示のキー操作/320・360・390pxを確認し、公開用1ページの具体差分を固定する。公開/マージ/外部投稿は別承認。今回はPR9 branchの最小修正＋記録8ファイルのみ、[CF-Pages-Skip]。main5f03a4d、本番257c7ec、PDFbranchce6a3aa、既存QA配信は無変更。GraphQLなし、追加費用0円、本人操作：不要。保存後に内容一致/隔離/skipを照合して最終commitを報告する。

---

## 2026-11-01 デスクトップ受入の残項目完了

実保存JPEGの再読込み、独立デコード、保存ファイルと同期コピーのSHA-256一致、容量/最小px変更による旧保存無効化、実UIの上下限一致・拒否・縮小・リセットを確認。詳細 `qa/RESULTS-2026-11-01.json`。前日の23検査は再実行していない。製品コード不変、不具合修正不要。Android実機・モバイル幅・ICC/HDR・他ブラウザ・メモリ・需要は未検証。公開は保留、次は限定公開の具体差分と計測方針を固定する。

---

## 2026-10-31 実Chrome検証の更新

本人承認後、既存本人限定QAサイトで23件すべて合格。製品UIも同意/確認前の禁止、34,393bytes・1200×800pxのJPEG生成、確認後のブラウザ実保存まで確認。詳細は `qa/RESULTS-2026-10-31.json`。保存再読込/ハッシュ一致、残るUI条件変更、Android実機/ICC/HDRは未検証。残りは実行環境の通信中断で停止し、認証承認待ちではない。製品コードは不変。新環境や同じ試験を一から作り直さない。本番公開は保留。

---

## 2026-10-31 再開位置

既存QAソースを本人限定の別HTTPSサイトへ配信済み（version1）。ブラウザはOpenAIの新規ログインで停止し、安全な認証要求は自動承認レビューに拒否された。23検査は未実行。新サイトを作り直さず、引継ぎの既存サイトを再利用する。Cloudflare再認証ではない。

画像の機能追加・公開は保留。代替の仮選定「除外日付き毎週予定→ICS」は `../schedule-ics/README.md`。12件のNode合格と合成ICSがあり、実カレンダー登録・需要は未検証。

---

## 2026-10-30 受入試験追加・公開保留

製品ソースは不変。`qa/index.html`は既存合成画像10枚で実Canvas検査を実行するためのページ。構文・fixture検証済みだが**ブラウザでは未実行**。23検査という設計上の数を合格数にしない。製品UI操作・ダウンロード・Android実機は別確認。

実行環境、手順、原稿、4候補比較、公開/停止基準は `../../docs/image-fit-validation-and-launch-2026-10-30.md`。通常のsite/配信にはqa/を含めず、承認されたQA環境のみsite/qaの2ディレクトリを同階層に配置する。標準プレビューはデーモン不在。新規本人限定HTTPS検証環境は別承認待ち。本番公開は保留、追加機能なし。

---

## 保存状態の更新（2026-10-30）

[Draft PR #9](https://github.com/MM20261010/columns-lab/pull/9) の専用ブランチへ保存済み。実装保存コミット `093477dc03acab7898df999c609ea8c9a122d712`、31試験の合格範囲は下記の通り。未公開・未マージ。古い「GitHub未反映」は初回準備時の記録。
次の優先作業は実ブラウザのJPEG生成とAndroid表示の検証。新ホスト・本番公開は別承認。ソースの正本はこのPRブランチであり、下記の承認パケットは初回スナップショットを指す。

# 画像サイズ合わせ：未公開試作

作成日：2026-10-30 JST。対象：GPT自律収益化、MM20261010/columns-lab。

JPEG・静止PNGを端末内で読み、容量の上下限と最小幅・高さを満たすJPEGを探索する。サーバーAPI、依存パッケージ、広告、解析、データの自動保存はない。1KB=1,000バイト。

`site/index.html` が試作。許可されたプレビュー/QA環境で確認する。配布用の単一HTMLも別途作成する。入力は合成画像で試すこと。Chrome/Firefox/Androidの実ブラウザと実JPEG生成はまだ未検証。

## テスト

Node.js 24で `node --test tests/*.test.js`。31件合格（核心18・静的プライバシー3・画面状態10）。画面試験はNode VMと模擬DOM/模擬Canvas。実際のCanvasコーデック、色、EXIF方向、スマホ表示、ダウンロード完了を証明しない。

## 保存・公開状態

GitHub未反映、PR未作成、未公開。既存本番と既存観測タスクは変更していない。新ツール用のホスト名、canonical、sitemap、実計測タグはまだない。noindexは意図した試作設定で、承認なしに検索公開しない。

承認用変更は同梱 `github-proposal.patch` と `docs/november-development-2026-10-30.md` を参照。既存ソースの変更はなく、実験コードは `experiments/image-fit/` へ保存する提案。GitHub保存・PR公開には本人承認が必要。本番公開は別の判断。
