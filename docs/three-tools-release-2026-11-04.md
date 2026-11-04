# 3ツール公開・観測移行（2026-11-04）

本人指示：11月中にCSV・画像・PDF文章整形の3ツールを公開し、11月30日まで新ツール開発を原則停止して集客・検索登録・実利用観測へ移る。今回、必要なPR作成・監査・マージ・本番反映を明示承認。費用0円・新規契約/アカウント/権限拡大なし。

## 画像 PR #10

開始head b2761580c36fa8933b0ffcbab2b2a2c4d82b3ff0。7bed973後の3コミットはCI追加/Ubuntu24.04固定のみで製品コードは97bc8f9と同一。既存run41752651824成功をコード・job・ログで照合。さらに567ebda71192f76e657a2449e86b6c80a21ecc8eでCIを補強、run41754246515成功。

実Chromium 145.0.7632.6 / Ubuntu24.04：320/360/390px×3方式の合成PNG読込→100×100px/100KB以下→実Download→Pillow独立全画素デコード/画素検査→JPEGを入力して再読込。白余白2949、中央切り抜き2258、引き伸ばし2650bytes。9組合せで合格。全3幅で横はみ出しなし・主要ボタン44px以上・重なりなし、範囲500×266px/91985bytes、1KB探索失敗後の保存禁止、訂正/リセット、pageerrorなしを確認。Node65合格。

固定head/17ファイル差分/main e6fabfeを再照合し、通常merge。公開commit `0d6676f36dbb4cbf81b69b00be883fd222e8b7db`、Pages canonical同commit/successを確認。公開URL https://columns-lab.pages.dev/tools/image-fit/ 。Android実機、広範な手動視覚/読み上げ/ICC/HDR/メモリは未検証。CI headlessの狭幅成功はAndroid実機の成功ではない。

## PDF既存成果の再利用と公開準備

試作branch experiment/pdf-text-20261101 / commit ce6a3aa58cb7810114e231de651f57b1096b8f5d、原型8886239、研究beedd8ab564b757b19d81fe253ba84d30c44854bを再利用。試作site/tests9blobの一致を確認。45 Nodeテストを再実行し合格。原文保持/復元/編集/コピー/リセットのcore/appは同一bytesを公開用へコピーし作り直さない。曖昧な改行は保持、10万UTF-16単位/5000行制限、PDFアップロード/OCRなし。

公開候補 /tools/pdf-text/ を準備：title/description/canonical/index、トップからのリンク、3ツール間の回遊、sitemap6URL、プライバシー文章取扱い説明。既存Cloudflare Web Analyticsを妨げないルート単位CSPを設定、追跡/内容イベントは追加しない。core/appはネットワーク/永続保存APIなし。元試作はnoindexの固定資料として維持。

公開用整合5テストを追加し、全体115合格（画像/既存65＋PDF原型45＋公開整合5）。実Chromium CIは既存25固定fixture全文一致・実clipboard・編集再コピー・原文復元/再整形/リセット・空/特殊文字・100000文字/超過回復・320/360/390px・ボタン/入力幅・pageerror・外部リクエストを確認する設計。結果を確認してから公開する。CIのクリップボード権限は合成文字列を扱う一時的ブラウザcontextだけであり、利用者権限やアカウント権限の拡大ではない。

本番ページでは既存RUMによる配信/閲覧計測通信があり、本文処理とは別。localhost CIの外部通信0を、本番の通信0とは報告しない。textareaの標準動作で改行コードはLFへ正規化されるため、バイト単位で元PDFのコピー表現を保証しない。語句・数字・引用符の書換えはしない。原文欄と結果欄は別に保持する。

## 監査と復旧

PDF用PRは最新main 0d6676fから専用branch release/pdf-text-20261104で作成。秘密情報/個人情報/実利用者データ追加なし、製品依存追加なし。CIはpublic repo標準Ubuntu runner、contents:read、artifact永続保存なし。準備コミットは[CF-Pages-Skip]、preview noneを維持。本人は公開承認済みだが、差分照合・CI成功・重大な既知問題なしをマージ条件とする。

問題時はPDF公開PRのrevertで画像更新後の状態へ戻す。画像PRの重大問題ならPR #10のrevertで0d6676fの親系統の旧画像版へ戻す。force reset・設定の無断拡張はしない。本番不具合がなければ復旧操作は不要。

## 公開後観測（追記予定）

PV、検索表示/クリック、ツール別利用状況、収益、費用、未解決課題を11月30日判断へまとめる。未取得は不明。ページPVは利用完了数と同一ではない。自己QA/ボットを実利用に混ぜない。検索インデックス/順位/1000PVを保証しない。

既存週1回観測・月次レビューを継続する方針。重複タスクは作らず、継続作業に必要な最新URL・観測限界・開発凍結方針をGitHubに記録する。Search Console/GA4/Cloudflareは既存権限で取得可能な範囲だけ確認し、本人へ定期ログインや転記を要求しない。Cloudflare GraphQLは今回も使用しない。
