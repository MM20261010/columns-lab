# 計測設定とGoogle検索到達の現状

現行確認：2026-10-13 20:50以降JST。開始main10744873efcbd87456789e9e80cacd51f432807c。対象https://columns-lab.pages.dev/。旧アカウント停止は現行障害でない。正当な確定報酬と出金を区別、欠測を0にしない。

| 項目 | 現行状態 | 根拠/限界 |
| --- | --- | --- |
| Googleアカウント/所有権 | 復旧・所有権成功 | 本人報告 |
| トップインデックス | 登録済み | 10/13本人GSC報告 |
| ツール | ライブ登録可能、20:44申請成功 | 本人報告、実登録未確認 |
| ガイド | 20:46Googleライブ取得404/登録不可、Fennec本文表示成功 | 本人報告、Google矛盾原因未確定 |
| 公開配信 | guide/sitemap/robots/tool200、末尾なし/index.html308→正規guide | Work4UA×6パス検査、Google実IPの確認ではない |
| サイトマップGoogle取得 | 取得失敗・最終読み込み10/12 | 本人報告、詳細/直近取得未確認 |
| 検索表示/クリック | 0/0（10/13本人表示確認） | 集計期間/フィルター/最終反映日未提示、全月0とはしない |
| Cloudflare RUM | 既存Read OAuthで限定窓取得済み | 当月/状態JSON参照、月次全体/第三者人数は不明 |

## 追加調査と現在の対応

[Google取得矛盾の調査](google-reach-investigation-2026-10-13.md)に24応答matrix/追加取得/本文hash/Pages設定/仮説と次の判定を記録。恒常的な末尾スラッシュ不具合やUA名だけの拒否は再現せず、現在のGoogle404解消を主張しない。サイトマップはXML正常4正規URL。Googleサイトマップ取得失敗とguide404が同じ原因か不明。新規認証/権限・再デプロイ・キャッシュ削除・URL変更なし。

このWorkの専用GSC readerはなく既存ブラウザーは前回about/未ログイン。今回ログインを繰り返さない。追加された本人確認を現行根拠にする。本人には**既存環境で1回まとめてguide完全URLのライブ取得とsitemap詳細を確認**してもらう。直近のsitemapライブ成功済みなら再テスト不要。手順/必要な状態だけの共有は上記調査文書。トップ再申請/ツール連続再申請/削除や毎日転記は求めない。

## 観測期間とKPI

RUM10/13 19:40〜10/20 19:40JST継続。top登録を全ページ到達とせず、guide404/tool登録待ちが残るアクセス数だけで需要なしと判断しない。実問題解消/Google取得成功の日時が確認できれば別7日窓を提案する。今は自動変更しない。

本人報告の検索0/0は日時付き限定観測として当月/状態JSONへ記録し、期間不明のまま10/1〜10/31月次列へ0を入れない。RUMから検索実績/実人数/CSV処理成功を推定しない。報酬/経費/純利益等の月次欠測はnull/空欄維持。

CSV本文/ファイル名/列名/個人情報を解析やGitHubへ送信しない。HTTP検証は公開静的情報のみでJS未実行。外部通信イベント/広告/Secrets/新接続は別承認。#2〜#5 Draft未マージ、#6公開承認済みを維持。本番変更/権限/認証/契約/支払いは明示承認前にしない。追加支出0円。

## 公式の判断根拠

- [Googleサイトマップレポート](https://support.google.com/webmasters/answer/7451001?hl=ja)：取得詳細とライブ「ページ取得」を確認、URLクロールと区別。
- [URL検査](https://support.google.com/webmasters/answer/9012289?hl=ja)：ライブ取得と実インデックスを区別。
- [Google UA](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers)：Google-InspectionToolとGooglebotを区別。
- [Cloudflare静的配信](https://developers.cloudflare.com/pages/configuration/serving-pages/)：index.html/正規URL転送とキャッシュの仕様。
- [Cloudflare指標](https://developers.cloudflare.com/web-analytics/data-metrics/high-level-metrics/)：Visitsと実人数/uniqueを混同しない。
