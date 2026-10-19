# 第6段階：CSVガイド見本の公開前監査・公開承認（2026-10-19）

基点main c50a6d75bb613c431abd660a81cdcd6789e43d58。本番21a067786dbbf27ebcec7f3c858d605a97b7c828 / success。2026-10-19再GETで本番自動公開有効、preview=none、出力site、build/root空、watch includes/excludes空を確認。設定変更なし。

## 承認と現在状態

本人は本番3ファイル＋検証/監査/引き継ぎ4ファイルの保存、専用PR作成・マージ、本番公開・確認、重大問題時の今回差分のみの取消を明示承認した。追加費用・権限追加・新規サービス・AdSenseは対象外。

ブランチ task/guide-example-release-20261019 を固定基点から作成するGitHub接続操作が403 Resource not accessible by integrationで拒否された。ブランチ作成成功・保存・PR・マージ・公開はいずれも未実施。追加権限やブラウザへの迂回は行わず停止。次回は読み取りを再照合したうえで、別途承認された書込手段がある場合のみ再開する。拒否を繰り返さない。

## 実装範囲

本番はsite/guides/csv-column-merge/index.htmlと新規site/assets/guide-example.js、guide-example.cssの3ファイルのみ。既存CSVツール、共有core/app/CSS、保存形式、無料機能、解析/広告/配信設定は維持。検証記録はtests/guide-example.test.js、本監査、agent-handoff.md、monthly-2026-10.mdの4ファイル。

## 証拠

検証済み単一HTML SHA256 e47ffc6f9922dc15ce22017794487eaab54313c640c4cc2e594fe9db885641ce。公開候補を内包HTMLへ梱包すると完全一致。再制作なし、製品コード修正なし。

本人報告（10/19 Android/Cromite）：表示、4行4列/合計1000の結合、保存、再読込一致、改変不一致、正しいCSVへの復旧、リセット消去、保存/選択無効化の8項目成功。担当者が実機や画像を直接確認した結果とは区別する。

既存5スイートcore/app/capacity-review/download-review/formula-reviewと新規16項目を再実行し合格。Node/DOM模擬と実機は別。review3本のローカル末尾余分な空行1個を取り除き既存main Git blob一致後に再実行済み。元ZIPは保全。隔離領域の公開差分適用・逆適用とも成功、旧ガイドbytes一致、新資産削除を確認。

安全監査合格：既存数式対策・負数保護を維持、textContent描画、厳格UTF8/8KiB/行セル上限、遅延結果排除、リセット無効化、保存開始のみ表示、保存先断定なし。新規送信・永続保存・依存・広告なし。一般口語、48px操作/14px間隔、狭幅縦配置、label/status/captionあり。既存解析を含めサイト全体無通信とはしない。

未検証：本番新資産の配信/キャッシュ、他OS/ブラウザ、Excel/Calc、大容量実機、読み上げ/200%拡大。公開前監査は合格、実公開・公開後確認は未実施。

## 公開と復旧

既存接続の書込不可が解決するまで公開しない。書込可能な承認済み手段で、最新main/preview設定確認→固定7ファイルの専用PR→実blob/差分/回帰確認→公開用マージ→Pages成功commitとHTTP/Content-Type/新ガイド・旧ツール動作確認。準備コミットはskipの実状態確認、公開マージはskipなし。古いPR #2〜#5を再利用しない。

重大問題は公開差分だけの専用revert PR/マージ/再公開で旧ガイドへ戻し新JS/CSSを削除。後続更新を巻戻さない。force reset/権限追加/設定変更はしない。今回復旧は未実施。

## 観測

10/20 19:40 JST締めは期間未終了・未取得。終了後、既定窓を対象ホスト固定で取得。PV/Visits、検索表示/クリック、第三者識別は別、欠測は不明。公開前後は同長期間で比較し自己QA混入・sampling・低母数を記録。新イベント解析なしで保存成功回数は測れない。売上・利益を推測しない。


## 2026-10-19 公開作業再開・接続復旧の確認

本人はChatGPT Codex ConnectorのInstall & AuthorizeをMM20261010/columns-labの1件に実施したと報告。今回読取でinstallation 172930198 / owner MM20261010 / repository_selection=selectedを認識し、そのinstallationのリポジトリ一覧はcolumns-labの1件のみ。専用ブランチtask/guide-example-release-20261019の作成成功を確認し、以前の403による停止は解消した。内部トークン種別は未取得だが、現接続で対象installation認識と実書込成功を確認した。追加権限/Secrets/接続変更はGPT側で未実施。

最新main c50a6d75bb613c431abd660a81cdcd6789e43d58、Pages本番21a067786dbbf27ebcec7f3c858d605a97b7c828/success、preview none、output site、watch includes/excludes空を再確認。保全ZIP内の7ファイルと作業候補はbyte一致、製品3ファイルは監査固定SHA-256と一致。製品コードと検証済みHTMLを修正していない。本追記は過去の停止記録を現在状態と区別するための記録更新。

本人の共通運用ルール：通常の調査/分析/測定/コード/テスト/開発ブランチ/PR/Issue/技術文書は既存権限内で自律実行可能。権限があることと個々の実行承認は区別する。未承認本番公開、大幅変更、復旧困難な削除、権限/認証/Secrets/保護設定変更、契約/新規登録/課金/受領条件同意、個人・機密情報の外部送信、承認超過は先に確認。確認待ちでも独立作業は続け、同一条件の承認を繰り返さない。新たな権限不足は将来の関連作業もまとめて最小設定案を示す。

本番3ファイル＋tests/guide-example.test.js＋本監査＋handoff＋monthlyの7ファイルの保存/専用PR/マージ/Pages公開/公開後確認、重大問題時の今回差分のみのrevertは本人承認済み。費用/新サービス/広告/権限変更は含まない。今は保存・PR・公開を進める段階であり、公開成功の結果は確認後に追記する。10/20 19:40 JST締めの観測は期間未終了・未取得。
