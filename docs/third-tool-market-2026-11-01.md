# 3本目の無料ツール市場調査（2026-11-01）

## 結論と調査範囲

第一候補は **PDFコピペの改行・段落整形**。次点は **重複行整理（重複の抽出を含む）**、**買物の2商品単価比較**。これは開発の優先順位の提案であり、検索流入・第三者利用・月間1,000PVの達成を証明したものではない。今回、新ツールの実装・公開・PR作成・PR9更新は行っていない。

日本語の検索語40個を個別に検索サービスで調査、7分野9サイトで合成入力を使い結果表示まで直接確認。別の上位候補LSXは接続リセットで操作できなかった。競合は「検索サービスで上位に出たサイト」と「Googleで確認した上位候補」を区別し、9サイトすべてをGoogle上位と呼ばない。

全件の確認日は2026-11-01。入力は架空の数値/文章/リスト/既存QA合成画像のみ。登録・課金・外部投稿なし。Cloudflare GraphQL不使用。通常アクセス/競合QAを第三者流入や事業KPIに加算しない。

開始main: `5f03a4da55ccd8493c852b7e24596f9bc2804f9c`。PR9 head: `fc479efe14f80a71d4e1b5a60b2c30baf2e87a15`、Draft/未マージ。本番既知commit: `257c7ec730634accbe545eb33984753b47ba8750`。PR9では11/1までにデスクトップJPEG保存/再読込の受入項目を完了済み。今回はそのQAを繰り返していない。

## 需要データの読み方と限界

- 40語の検索結果は検索サービスsystem2の取得結果。Googleの順位・国内月間検索数ではない。各語の根拠URLは下表、上位3資料のタイトル/URLは別JSONへ記録。
- Googleブラウザで直接結果を確認できた主対象語は「重複行 削除」「2つのリスト 比較」の2語、補助検索「2つのリスト」も確認。検索候補の接頭辞2件、関連検索2件を取得。
- 追加の「改行 削除 ツール」はGoogleから「通常と異なるトラフィック」のreCAPTCHAが表示されたため未確認。操作/突破/別経路でのGoogle再取得なし。検索画面だけで完結するかの確認は、未確認語を推測で埋めない。
- Google Trendsは未ログインで利用できた。国内、過去12か月、すべてのカテゴリ、ウェブ検索、検索キーワードを比較。月間検索数ではなく正規化されたサンプルの相対指数。検索候補の存在も検索数の証拠にしない。
- **40語すべての正確な国内月間検索回数は不明**。新サイトの獲得可能クリック/PV、順位難易度の定量値、利用者調査、コンバージョン率も未取得。欠測を0にしない。

### Googleの実検索画面

「重複行 削除」はLSXの削除ツール、Excel解説、Microsoft等の説明が混在し、AI概要あり。「2つのリスト 比較」もExcel照合の解説とListDiffなどツールが混在しAI概要あり。いずれも説明を読むだけの意図と、実データを処理する意図を分ける必要がある。順位は当該環境・日時の観測で固定順位ではない。任意のリスト加工そのものが検索画面内で完結することは確認していない。

取得した候補（抜粋）：
- 接頭辞「重複行」：重複行削除ツール、重複行 チェック、重複行 抽出、重複行 カウント、重複行 削除 エクセル、重複行削除 sql。
- 接頭辞「2つのリスト」：2つのリスト 重複チェック、2つのリスト 照合、2つのリスト 突合 excel、2つのリスト 重複 抽出、2つのリスト 重複していない。
- 関連検索「重複行 削除」：エクセル 重複削除 行ごと、残さない、関数、複数条件、できない、複数列。
- 関連検索「2つのリスト 比較」：エクセル 2つのシート 比較 抽出、2つのデータ 照合 抽出、VLOOKUP、Excel リスト 比較。

上記候補/関連語は40語のスクリーニング件数に重複加算していない。Google追加調査が制限された理由は[ブラウザ制限の案内](https://help.openai.com/articles/20001280-using-cloud-browser-in-chatgpt#when-a-website-blocks-the-task)も参照。

### Google Trends 実観測

比較Aの平均欄：

| 重複行削除 | 営業日計算 | 単価比較 | 改行削除 | 文字数カウント |
|---:|---:|---:|---:|---:|
| 0 | 1 | 1 | 1 | 72 |

比較B（文字数カウントを除き画像余白追加へ置換）の平均欄：

| 重複行削除 | 営業日計算 | 単価比較 | 改行削除 | 画像余白追加 |
|---:|---:|---:|---:|---:|
| 8 | 34 | 42 | 55 | 1 |

Bの画面URL：
https://trends.google.com/trends/explore?geo=JP&q=%E9%87%8D%E8%A4%87%E8%A1%8C%E5%89%8A%E9%99%A4,%E5%96%B6%E6%A5%AD%E6%97%A5%E8%A8%88%E7%AE%97,%E5%8D%98%E4%BE%A1%E6%AF%94%E8%BC%83,%E6%94%B9%E8%A1%8C%E5%89%8A%E9%99%A4,%E7%94%BB%E5%83%8F%E4%BD%99%E7%99%BD%E8%BF%BD%E5%8A%A0&hl=ja

表の週データ先頭2025/10/26、末尾2026/11/01。末尾は未完了週の可能性があり直近減少の判定に使わない。A/Bは別々に正規化され、相互の数値をそのまま比較しない。「改行削除55回」「文字数72倍」「重複0なので無需要」とは言えない。「PDF 改行 削除」の固有検索数は不明。関連語にWordも含まれ、親語の関心をPDF用途全体へ帰属させない。[公式のデータ説明](https://support.google.com/trends/answer/4365533?hl=ja)。

### 実際の困りごとの根拠と代替手段

- [2026年の利用者質問：PDFからChatGPTへ貼る際の空白/改行の乱れ](https://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q13328773023)。手修正を減らすWebサービスを求める質問を確認。回答にはAIへのPDF直接添付も提案されており、AIが代替になることも記録する。質問1件を市場規模とはしない。
- [Adobe Community：PDFコピー時の不要な改行](https://community.adobe.com/%E8%B3%AA%E5%95%8F-114/%E3%82%B3%E3%83%94%E3%83%BC%E3%81%97%E3%81%9F%E9%9A%9B%E3%81%AB%E4%B8%8D%E8%A6%81%E3%81%AA%E6%94%B9%E8%A1%8C%E3%81%8C%E3%81%A7%E3%81%8D%E3%81%A6%E3%81%97%E3%81%BE%E3%81%86-332444)。古い質問で、現在の量の証明にはならない。
- [重複を一つだけ残したい利用者質問](https://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q10221731770)。古い需要例。回答のエディタ/Excelでも解決できる。[Microsoft公式](https://support.microsoft.com/ja-jp/excel/get-started/filter-for-unique-values-or-remove-duplicate-values)も既存の解法。
- [価格/容量の割る順番で迷う質問](https://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q14282335754)、[100g単価の計算式を求める質問](https://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q1121022296)。困りごとはあるが古く、Webツール利用意向/現規模は別。店頭表示・スマホ電卓でも代替可能。

## 40語のスクリーニング

以下の「中心」は取得した検索サービス結果の上位資料を読んだ分類。Google SERPの比率や全結果の網羅統計ではない。月間回数は全行不明。答えが検索画面で完結するかは直接観測2語以外は未確認。「可能性」は仮説。

| # | 日本語検索語 | 結果の型 | 意図/需要根拠の解釈 | 根拠URL |
|---:|---|---|---|---|
| 1 | 日数計算 | ツール中心 | 初日を含むかで意図が分かれる。Google回答内完結は未確認。 | [1](https://bestcalendar.jp/tools/nissu)・[2](https://keisanbox.com/keisan/nissu/) |
| 2 | 営業日計算 | ツール中心 | 土日祝除外・N日前後。Trendsと実操作あり。祝日保守が必要。 | [1](https://engineer-toolbox.jp/tools/business-days/)・[2](https://jp.datedb.net/tool/business-days/) |
| 3 | 何日後 計算 | ツール＋解説 | 定型日付なら検索内完結の可能性。実際の回答枠は未確認。 | [1](https://bestcalendar.jp/tools/nissu)・[2](https://keisan.navilly.com/tools/days-after.html) |
| 4 | 日付 曜日 一覧 作成 | ツール中心 | 日付/曜日/連番の意図が混在。需要規模は未確認。 | [1](https://jp.datedb.net/)・[2](https://www.calc-age.com/day_of_week) |
| 5 | 締切 逆算 | 解説＋ツール | 締切の法的・業務固有条件は別。逆算一般も混在。 | [1](https://kigennavi.jp/tools/deadline/what-is-before-deadline.html)・[2](https://siutil.com/ja/business-days/) |
| 6 | 単価比較 計算 | ツール中心 | 買物の2商品比較。親語のTrendsあり。 | [1](https://tsulo.com/life/tanka-hikaku)・[2](https://kakakuhikaku.jp/keisan/) |
| 7 | 100g あたり 計算 | ツール中心 | 100g単価の具体作業。店頭表示・電卓も代替。 | [1](https://eolmaji.com/ja/unit-price-100g)・[2](https://tsulo.com/life/tanka-hikaku) |
| 8 | 容量 単価 比較 | ツール中心 | 容量と入数の比較。親語のTrendsを当該語の実数にしない。 | [1](https://tsulo.com/life/tanka-hikaku)・[2](https://tegaruya.com/unit-price/) |
| 9 | 税込 税抜 計算 | ツール中心 | 単一数値は電卓/検索内回答に代替されやすい（仮説）。 | [1](https://keisan.navilly.com/tools/tax-included.html)・[2](https://sorobannote.com/calc/zeikomi) |
| 10 | 割引率 計算 | ツール＋別意図 | 買物と金融の割引率が混在。数値需要は不明。 | [1](https://www.calculatorjp.com/discount-rate-calculator)・[2](https://www.mlit.go.jp/common/001090778.pdf) |
| 11 | 改行 削除 ツール | ツール中心 | PDFコピペの困りごとの質問を補強調査。Google直接SERPは確認画面で中断。 | [1](https://www.toolsina.com/ja/line-break-remover/)・[2](https://tools.zerethon.com/ja/remove-line-breaks) |
| 12 | 空白 削除 ツール | ツール中心 | 全空白削除は意味破壊に注意。改行親語のTrendsは別物。 | [1](https://tools.zerethon.com/ja/whitespace-remover)・[2](https://kei-tool.com/replace) |
| 13 | 全角 半角 変換 | ツール中心 | かな/英数字/記号の範囲差。競合多数。 | [1](https://www.douni.one/jp/fullwidth-halfwidth)・[2](https://roberin.com/ja/fullwidth-halfwidth-converter/) |
| 14 | 文字数 カウント | ツール中心 | Trendsは比較内で突出。大手メディアもあり競争強い。 | [1](https://count.yuki-lab.com/)・[2](https://www.fnn.jp/list/character-count) |
| 15 | 文章 差分 比較 | ツール中心 | 2文章の差分。差分アルゴリズムと長文性能の負担。 | [1](https://tohitsu.co.jp/diff/)・[2](https://tools.potikatsu.com/t/text-diff/) |
| 16 | 重複行 削除 | 混在（Google直接） | ツール＋Excel解説＋AI概要。Google候補/関連あり。 | [1](https://www.webharu.com/office/remove-duplicates/)・[2](https://tools.ariake-ai.com/tools/remove-duplicate-lines) |
| 17 | 重複 チェック ツール | ツール中心 | 1リストか2リストか、文字列か文章盗用かを区別。 | [1](https://itakata.com/tool/duplicate.php)・[2](https://kei-tool.com/lines) |
| 18 | 2つのリスト 比較 | 混在（Google直接） | Excel照合解説＋比較ツール＋AI概要。候補/関連あり。 | [1](https://libratool.com/ja/tools/list-compare)・[2](https://comparetwolists.app/ja/) |
| 19 | 行 並び替え ツール | ツール中心 | Excelやエディタで代替可能。かな・数値順の差。 | [1](https://tools.zerethon.com/ja/sort-lines)・[2](https://kotoba-tools.sugars.chatgpt.site/line-sort) |
| 20 | 連番 作成 ツール | ツール＋解説 | 連番文字列と番号札PDFは別。ニーズを分離。 | [1](https://nyankotools.com/tools/sequence-generator/)・[2](https://ainosensei.com/tools/number-ticket/) |
| 21 | PDF 結合 無料 | ツール中心 | ローカル処理も既存。PDF互換性/容量対応の保守負担。 | [1](https://mamepdf.jp/)・[2](https://pro.alcuesto.jp/tools/pdf-merge) |
| 22 | PDF 分割 無料 | ツール中心 | 範囲選択の既存サービス多数。スマホ実操作未確認。 | [1](https://pdf-tool.apps.wsww.jp/ja/split-pdf)・[2](https://mysign.jp/pdf-split-online) |
| 23 | PDF ページ 並べ替え | ツール中心 | Adobe公式も存在。並べ替えのタッチ品質未確認。 | [1](https://ainew.jp/pdf-reorder)・[2](https://www.adobe.com/jp/acrobat/online/rearrange-pdf) |
| 24 | PDF 2in1 無料 | ツール中心 | 印刷設定のN-upとファイル再構成は別。規模不明。 | [1](https://temoto-tools.com/pdf-nup/)・[2](https://hanetool.com/pdf/) |
| 25 | PDF 墨消し 無料 | ツール＋解説 | 見た目の黒塗りだけで内容が残るリスク。第3候補にはしない。 | [1](https://pdf.scissor.studio/ja/redact-pdf/)・[2](https://www.adobe.com/jp/acrobat/hub/how-to-white-out-on-pdf.html) |
| 26 | 画像 余白 追加 | ツール＋アプリ | Trends比較内は小さい。既存画像PRと重なり追加優先低。 | [1](https://mameapp.com/tools/image-add-padding)・[2](https://webspe.net/tools/image-padding/) |
| 27 | 画像 背景 透過 | ツール中心 | モデル/演算負荷・画質競争が強い。初期追加費用ゼロでも保守重い。 | [1](https://kitbench.net/background-remover/)・[2](https://yattokun.com/tools/haikei-touka) |
| 28 | 画像 一括 リネーム | ツール中心 | ZIP保存/一括命名。スマホファイル操作の負担。 | [1](https://imageonline.io/ja/rename-image/)・[2](https://tools.studioasari.co.jp/file-tools/batchrename) |
| 29 | EXIF 削除 | ツール＋公的解説 | 位置情報削除の必要性はIPA資料。完全な除去/再エンコード検証が必要。 | [1](https://temoto-tools.com/exif-remove/)・[2](https://utilab.jp/tools/exif-checker/) |
| 30 | 画像 縦横比 計算 | ツール中心 | 単純比率は検索/電卓代替の可能性。画像PRとの差が小さい。 | [1](https://keisan.navilly.com/tools/aspect-crop.html)・[2](https://itkagyo.com/tools/aspect-ratio-calculator/) |
| 31 | Excel 先頭ゼロ 消える | 公式解説中心 | 失われたゼロは推測復元不能。単独新ツールより既存ガイド向き。 | [1](https://support.microsoft.com/ja-jp/excel/keeping-leading-zeros-and-large-numbers)・[2](https://www.tku.ac.jp/iss/guide/classroom/tipspc/excel0.html) |
| 32 | CSV 文字化け 変換 | 公式解説＋ツール | 財務省に開き方のFAQ。既存CSVとの回遊強いが文字コード検証負担。 | [1](https://www.mof.go.jp/faq/statistics/12ua.htm)・[2](https://toolbase.cc/file/convert/charset) |
| 33 | TSV CSV 変換 | ツール中心 | 引用符/セル内改行への対応が必要。CSVとの回遊強い。 | [1](https://quinvert.com/ja/tsv-to-csv)・[2](https://sakutto.ai/tools/tsv-csv-convert) |
| 34 | 表 Markdown 変換 | ツール中心 | 実ブラウザで貼付→自動変換→コピー確認。先行競合が速い。 | [1](https://oha-yo.com/tools/table/)・[2](https://uekibachidan.com/mdtable/) |
| 35 | Excel 重複 抽出 | 公式解説中心 | Excel機能が代替。Webへ貼る必然性は別に必要。 | [1](https://support.microsoft.com/ja-jp/Excel/get-started/filter-for-unique-values-or-remove-duplicate-values)・[2](https://support.microsoft.com/ja-jp/excel/get-started/filter-for-unique-values-or-remove-duplicate-values) |
| 36 | 時間 計算 ツール | ツール中心 | 勤務/経過/加算など複数意図。日跨ぎ/丸めの要件増。 | [1](https://keisan-navi.jp/date/jikan/)・[2](https://shikumiyasan.com/life/jikan/) |
| 37 | 分 時間 変換 | ツール中心 | 定型変換は検索内完結のリスク（未確認）。 | [1](https://convert.app/ja/time/minute-to-hour/)・[2](https://keisan.me/jikan/henkan.php) |
| 38 | 比率 計算 | 初回検索は偏り・補足でツール確認 | 初回は統計PDFに偏った。別検索系で補強し工具需要と断定しない。 | [1](https://www.mhlw.go.jp/toukei/saikin/hw/jinkou/kakutei12/dl/01_tyo.pdf)・[2](https://www.mhlw.go.jp/toukei/saikin/hw/jinkou/kakutei23/dl/01_cho.pdf) |
| 39 | パーセント 計算 | ツール＋解説 | 電卓・検索回答と競合。ケース別UIが必要。 | [1](https://www.luft.co.jp/cgi/percent.php)・[2](https://percentage.onl/ja/learn/percentage-formula/) |
| 40 | QRコード 作成 無料 | ツール中心 | 既存無料サービス多数。静的QR/動的追跡QRを分ける。 | [1](https://www.qr-code.jp/)・[2](https://qr.c-cloud.co.jp/tools/generator/design) |

「比率 計算」は最初の取得で公的統計PDFに偏ったためsystem1で「比率 計算 無料 ツール」を補足。[ラッコツールズ](https://rakko.tools/ja/tools/ratio-calculator)、[choalabs](https://www.choalabs.com/ja/calculator/ratio)のツールを確認した。初回の偏りを都合よく削らずJSONに残した。

## 競合の実ブラウザ比較

実Chrome/Linuxのデスクトップ。本文入力は貼付相当の1入力単位、価格等はフィールド数、処理ボタンと設定変更を別に数えた。これをスマホの実タップ数とは呼ばない。ページ遷移/フォーカス/OSファイル選択のタップ数は未測定。結果表示までを基本ゴール、コピー/保存は下記の実測範囲のみ。

**スマホ幅/Android実機/タッチは全9サイト未検証**。端末モードのキーボード操作を試したがviewportはデスクトップ幅のままで、スマホ検証に成功していない。したがって「スマホで使いやすい」は下の設計仮説であり実測評価ではない。広告は今回の表示/経路だけの観測。表示されなかったサイトを広告ゼロとはしない。通信遮断等のプライバシー監査も未実施。

| 分野 / 競合 | 入力単位 | 処理ボタン | 変更した設定 | 結果表示 | 持ち帰りの検証 |
|---|---:|---:|---:|---|---|
| 2リスト比較 / [ListDiff](https://listdiff.com/ja/risuto-hikaku) | 2 | 0 | 0 | Aのみ001・りんご、共通002、Bのみ2・みかん、和集合5項目 | コピーは未操作 |
| 重複行整理 / [ハルオフィス](https://www.webharu.com/office/remove-duplicates/) | 1 | 1 | 0 | 001 / 002 / APPLE / 003 | 保存ボタン1回→登録モーダルで停止。コピー未操作。 |
| 重複行整理 / [Ariake Tools](https://tools.ariake-ai.com/tools/remove-duplicate-lines) | 1 | 0 | 0 | 001 / 002 / APPLE / apple /  003  | コピーは未操作 |
| 単価比較 / [tsulo](https://tsulo.com/life/tanka-hikaku) | 4 | 0 | 0 | A49.67円/100g、B39.80円/100g、B19.9%安い | 結果閲覧まで |
| 営業日計算 / [エンジニアの道具箱](https://engineer-toolbox.jp/tools/business-days/) | 2 | 0 | 0 | 2026-11-04（水）、2日後 | 結果閲覧まで |
| 改行整形 / [くらしの便利ツール](https://kei-tool.com/replace) | 1 | 0 | 1 | 今日は晴れ。 /  / 次の段落。 | コピー未操作 |
| 改行整形 / [てもとツール](https://temototool.com/tools/linebreak-cleaner/) | 1 | 0 | 0 | 本日は晴れ。 /  / 引用として残したい文章。 / ・項目A / ・項目B | コピー1回後に全面広告。クリップボードは直前のMarkdownのまま。コピー完了は未確認、追加閉じる操作は未実施。 |
| 画像余白 / [Webspe](https://webspe.net/tools/image-padding/) | 1 | 0 | 1 | 840×640px、四辺20px、PNGと画面表示 | 保存ボタン1回。Download APIがパスを返したがファイル読取りはENOENT、保存ファイルの再デコード未確認。 |
| 表Markdown変換 / [植木鉢団](https://uekibachidan.com/mdtable/) | 1 | 0 | 0 | 項目/金額のMarkdown（見出し＋データ2行） | コピー1回、クリップボードが出力全文と一致 |

具体的な観測と改善余地：
- ListDiff：2入力で即時結果。既に先頭ゼロを保持。ツールバー/英語/集合記号を減らし、日本語の目的別表示へ整理する余地はあるが、単に「2つを比較」は差別化にならない。CompareTwoListsには重複件数の表示もあり、独自機能とは言えない。
- 重複行：ハルは初期設定で大小文字同一視/trim、保存時登録モーダル。Ariakeは貼るだけで大小文字/空白保持の6→5行、削除行確認もあり登録不要。登録不要・順番保持だけではAriakeに対し優位ではない。重複抽出もハルに既存。
- 単価：tsuloは4数値で自動計算し既に速い。比較2商品だけを先頭へ、数字キーボード/入力順/結果の見やすさへ絞る仮説はあるが、スマホ比較未完了につき優位性は未証明。
- 営業日：11/2の1営業日後が11/4。計算前提を明示したN日前後の専用入口は候補だが、祝日更新/会社休日/初日の扱いを保守する負担あり。
- 改行：keiでは初期の例示置換が本入力にも残り「本日→今日」となった。てもとツールは段落/箇条書き/判定説明を既に備えるが、引用符除去が初期ON。コピー操作時に全面広告へ遷移し、直後のクリップボードは前のMarkdownのまま。コピー成功と断定しない。全利用者で起こる/コピーの機能不良とも断定せず、今回操作の割込みとして記録する。
- 画像余白：20px指定で840×640と即時表示、保存APIのパス返却あり。ただしそのパスのファイルが見つからず、保存した画像自体の独立確認は未完了。PR9の既存受入試験の成否と混同しない。
- 表Markdown：貼付1回＋コピー1回でクリップボード全文一致。先行が短い導線と全角対応を実装しており、同等コピーだけを3本目にする理由は弱い。
- Googleで確認したLSXは通常の接続リセットで画面到達できず操作未検証。bot拒否/サイト障害と断定しない。Ariake等へ切替済み。

## 選定の比較（実測ではなく、上記根拠に基づく判断）

| 候補 | 需要根拠 | 新規サイトの検索入口/獲得余地 | 具体的な差/スマホ設計仮説 | 維持コスト | 自然な回遊 | 判断 |
|---|---|---|---|---|---|---|
| PDFコピペ改行・段落整形 | 2026利用者質問＋親語Trends＋専用競合 | 「PDF コピペ 改行」「改行 削除 段落 残す」。一般語は競争強、長尾の余地は低〜中・未実証 | 語彙/引用記号は初期保持。貼付→結果→コピー、全面広告なし。1列縦UIを検証する | 低〜中：改行境界/英文接続の誤変換をテスト。OCR/PDF解析なし | CSVセル内文章の整形は限定的。CSV全体を貼って壊さない注意。画像から文章を読む機能はないため画像との回遊は弱い | **第一候補、確度は中未満** |
| 重複行整理/重複抽出 | Google候補/関連＋Trends小＋利用者質問 | 「重複行 削除 ツール」「重複行 抽出」、Excel解説/AI概要と競合。低〜中 | 登録なしTXT、大小文字/空白/ゼロを勝手に変えない。既存にもあり優位は小さい | 低：比較モード/大規模貼付/正規化の境界 | CSV1列の整理と自然、画像は弱い | **次点1** |
| 2商品単価比較 | Trends＋価格/容量で迷う質問 | 「100g あたり 計算」「容量 単価 比較」。定型回答/電卓でも代替。低〜中 | 4数値の最短経路。既に速い競合があるためモバイル入力改善を証明する必要 | 低：単位/入数/丸め、価格データの収集なし | 既存2ツールと弱い。買物を入口にツール一般へという期待は未検証 | **次点2** |
| 営業日/期限逆算 | Trends＋候補ツール多数 | 「N営業日前」等。既存特化サービスが多数 | N日前後の欄を最上部、初日/除外日を結果横へ | 中：祝日/特例/対象範囲、法的期限保証をしない | CSV内期日の確認はあり得るが未検証 | 保留 |
| 2リスト比較 | Google候補/関連、実SERP | Excel照合記事が強い。ツールの入口は存在 | 英語/集合記号を日本語に、重複規則を明示。既存高機能 | 低〜中 | CSVと強い、画像は弱い | 重複整理と同時には増やさない |
| 表Markdown | ExcelからMarkdownへのツール意図 | 開発者/README用途、既存速いツール | 既存は貼付1回で自動変換・コピー。明確な優位未発見 | 中：引用符/パイプ/セル内改行/双方向 | CSVと強い | 保留 |
| 画像余白 | 親語Trendsは比較内小 | 専用競合/アプリあり | 既存余白UI/保存導線が既に短い | 中：画像形式/向き/色/保存 | 画像サイズ合わせと強い | PR9範囲拡張より需要検証を優先 |
| 文字数/PDF/背景透過/QR等 | 検索結果にツール、文字数Trends強 | 大手/専用既存も強い。大きい需要＝新規が取れるではない | 現時点で具体的な短縮余地の実証なし | PDF/背景除去は中〜高、文字数/QRも飽和 | PDF/画像は接点、QRは弱い | 3本目の先行採用なし |

検索結果の件数・ツールサイト数・候補数から検索量/流入可能PVを算出していない。SEO難易度と回遊は分析上の推定。1,000PVに必要な検索数/順位/CTRの積は未測定で数値予測しない。

## 次の開発に渡す具体案（今回は未実装）

仮題：**改行削除・段落整形｜PDFコピペの文章をそのままつなぐ**。1ツール1ページを原則とし、同じ機能のキーワード別薄いページを量産しない。

最小要件：
1. 貼付用textareaと結果の1列配置。貼付だけでプレビュー、コピー1ボタン。入力は端末内の一時状態、送信/自動保存なし。
2. 初期モードは空行による段落を残して行を接続。語彙・大文字小文字・全角半角・行頭引用記号はそのまま。引用符除去や全空白削除は初期OFF。日本語内の接続/英文のスペースを明示し、勝手な言い換えなし。
3. 変更した改行数と前後比較を表示。原文へ戻せる。句点/箇条書きなどの推定は完璧と称さない。初版はOCR・PDF直接読込・翻訳・AI補正・ユーザー登録を含めない。
4. キーボード表示時の入力→結果→コピー、320/360/390px相当で横はみ出しとタップ領域を実ブラウザ検証。Android実機がない場合は別枠で未検証。巨大入力は限界を明示し無限処理をさせない。
5. サーバー側に本文/ファイル/入力値を収集しない。将来の計測はページ単位/非内容の完了イベントなど必要最小限にし、既存CSP/RUMとの整合を公開前に審査する。

検索流入ページ：上部に即使えるUI、下に「PDFで行の途中が改行される」「段落を残す」「英語の単語を離す」「Excel/CSV全体には使わない」の例とFAQ。検索説明文は無料/登録不要/本文を送信しない/言い換えなしを事実確認後に記載。CSVページからは「1セル分の文章を整える」場合のみ、画像からは画像テキスト化を提供するかのような誤誘導をしない。外部投稿は今回行わず、紹介は将来の別承認。

受入/成功/撤退の基準（予測値ではなく提案する判定ルール）：
- 実装前に合成入力10ケース（日本語折返し、段落、英文、引用、箇条書き、空入力、CRLF、絵文字、全角空白、上限）と期待出力を固定。改行と選んだ接続スペース以外の文字変更0件。本文が端末外へ送られないことを確認。
- スマホ幅で貼付1回＋コピー1回の経路を既存専用競合と比較し、横移動/広告閉じる/登録不要を実証。優位を確認できなければ実装規模を拡げない。
- 公開は別承認。公開後14日で取得できた非自己の検索表示/クリック/完了を評価。欠測やインデックス未反映を無需要としない。
- インデックス/正常測定を確認したうえで28日間、対象の自然検索クリック0かつ非自己の利用完了0なら追加投資を止め候補を再評価。これは需要が世界に存在しないとの断定ではない。11/30より後に延びる場合も期限を偽らず、11/30時点は観測窓未満と記録。
- 11/30目標へ間に合わないからと機能量産しない。文字数カウント等の高Trends一般語を足すだけでは勝てない。

**次のWorkは1件：上記1ページの最小要件・10ケースの期待出力・スマホの2操作導線を固定し、限定したローカル試作と競合比較に進む。** 今回は市場調査/候補選定のみを完了し、実装へ着手していない。実装の着手は次の指示の範囲、本番公開/外部投稿/マージは必ず別承認。

## 保存と引継ぎ

研究専用ブランチ `research/third-tool-market-20261101` をmain固定基点から作成し、文書5ファイルのみ保存する。PR9の実装/文書とmain/本番は変更しない。現在の研究判断をPR9の機能/QAを巻き戻す指示にしない。PR9最新の引継ぎも別途参照する。11月ログはPR9最新文書を再利用して研究節を追加、製品コードは取り込まない。

機械可読記録：
- `docs/third-tool-keywords-2026-11-01.json`：40語、資料URL、調査方法、Trends相対値、全件monthly_searches_japan=null。
- `docs/third-tool-browser-2026-11-01.json`：9サイトの合成入力/表示結果/操作数/未検証。
- `docs/agent-handoff.md` と `docs/monthly-2026-11.md`：再開位置。

保存後にリモート5内容の一致、main/PR9 head不変、Pages skip/本番不変を確認し最終コミットを報告する。本人操作は不要。秘密情報/個人情報/実利用者データは新規記録へ含めない。
