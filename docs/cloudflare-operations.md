# Cloudflare接続・運用準備（2026-10-11）

対象は `MM20261010/columns-lab`、Pagesプロジェクト `columns-lab`、公開ホスト `columns-lab.pages.dev`。WorkライブブラウザーのCloudflareログイン403は再試行しない。初期費用0円。APIトークンはチャット、コード、CSV、ファイル添付、Issue、PR本文、コマンド引数へ渡さない。

## 現状とMCPを優先する経路

Cloudflare公式API MCPのURLは `https://mcp.cloudflare.com/mcp`。公式実装はOAuthとAPIトークンを扱い、OAuthでアカウントと権限を選択できる。通常のWebページではなくMCPプロトコルのエンドポイントなので、Web検索ツールで開けなかったことを利用不可の根拠にしない。

このWork会話の接続済みツールにCloudflareは存在せず、接続候補のCloudflare検索は0件。任意のMCPを登録する呼出し機能も見当たらない。そのため「この会話から直接利用できる」ことは未確認。Work全体がMCP非対応だと断定しない。

OpenAI公式資料では、ChatGPT WebのPluginsで＋ → Add custom MCP server → URLとOAuthを指定して接続する経路がある。画面・権限がこの利用者に提供されているかは未確認。利用できる場合、人間に必要なのはカスタムMCP追加とCloudflareのOAuth認証・権限承認。最初は対象アカウントのPages読み取りのみを選び、全アカウント・全サービスの権限は許可しない。接続後にGPTが認証先とプロジェクトのGitHubソースを照合する。実行するのは固定のGETのみ。OAuthによる新規アクセス許可は人間が承認する。APIトークンをMCP設定例へ埋め込まない。

## 接続できない場合のActions実装

`.github/workflows/cloudflare-audit.yml` と `scripts/cloudflare_audit.py` を用意した。最初は手動実行のみで、認証情報登録前に自動起動しない。PR・push・外部fork・pull_request_targetからの実行経路は作らない。

1. mainのレビュー済みコミットを公式checkoutの固定SHAで読む。保存用GitHub認証情報は残さない。
2. GitHub Environment `cloudflare-read` に保管されたSecretを、APIを呼ぶ1ステップだけに渡す。
3. `GET /accounts/{account_id}/pages/projects/columns-lab` を1回だけ実行。ホストは `api.cloudflare.com` に固定。任意URL・JSON・シェル入力はない。転送先へのAuthorization流出を防ぐためリダイレクトを拒否。時間・応答サイズを制限。
4. プロジェクト名、pages.devホスト、GitHub所有者とリポジトリを照合。不一致なら停止する。
5. main、output directory、build command、自動デプロイ設定、Analytics設定の有無、本番デプロイ状態を安全な固定項目へ変換して公開ログへ出す。raw API応答、環境変数、Account ID、Analyticsトークン、例外tracebackは出さない。

Analyticsの設定があっても「収集確認済み」とは扱わない。HTTP403、Secret不足、不正データ、型変更は成功として記録しない。数値取得やAnalytics有効化はこの読み取り実装の対象外。WorkのGitHubコネクタに新規workflow_dispatch操作は現在見当たらないため、登録後の初回実行は許可済みGitHubブラウザーのActions画面を使う。ログ読み取り用コネクタはある。完全無人の起動は別途実行経路を検証してから有効化する。

## 最初の接続に必要な人間の操作

MCPのOAuth接続が使えない場合だけ行う。秘密値はChatGPTへ返さない。「登録済み」とだけ知らせる。

| 登録先・用途 | 名前・値の扱い | 権限 |
|---|---|---|
| Cloudflare User API Token | 任意名（例: columns-lab-audit）。値は作成画面から直接GitHubへ | Account → Cloudflare Pages → Read（API資料のPages Read）。Account ResourcesはこのPagesを所有する1アカウントだけ |
| GitHub Environment secret | `CF_PAGES_READ_TOKEN` | 上記トークンのみ |
| GitHub Environment secret | `CF_ACCOUNT_ID` | 同じCloudflareアカウントの32桁ID。秘密鍵ではないが公開ログには出さない |

GitHub Settings → Environmentsで `cloudflare-read` を作る。Deployment branches and tagsをSelected branches and tagsにし、Branch `main` だけを許可。forkや他ブランチは許可しない。SecretはRepository secretsではなくこのEnvironmentに置く。読み取りジョブの毎回レビューは不要だが、初回のアクセス付与と設定は人間が確認する。

トークンのリソース制限は基本的にアカウント単位。スクリプトはcolumns-labに固定されるが、トークン自体が他のPagesプロジェクトを読めない保証にはならない。別プロジェクトが同アカウントにある場合、この範囲を承認できるか確認する。Zone/DNS、Workers編集、Account Settings編集、Billing、全アカウント、Global API Keyは不要。Pages Readが選べない場合にEditへ置き換えず停止する。

短い有効期限を設定する（初回検証なら30日を目安）。継続運用で期限・更新頻度を見直す。GitHub標準ランナーの送信元IPは変動するため、この案ではClient IP制限を仮定しない。固定IPランナーの有料契約は不要。

## 読み取りが成功した後の運用

サイト変更と再デプロイは既存のGitHub main → Cloudflare Pages連携を維持する。Cloudflareへの書き込みトークンを持たずに、GPTはコード修正・PR・公開後検証を続けられる。Actionsの読み取り結果で構成とデプロイを確認する。

月次確認の自動実行を追加する場合は、接続実証後にscheduleを追加する。GitHubのcronは遅延や未実行があり、公開リポジトリでは長期非活動で無効化される場合がある。月次レビューはジョブ成功と欠測を区別する。現在の月次レビュー設定はこのAPI接続を使用していない。

### 設定変更が必要になった場合の設計（未実装・未許可）

| 操作 | Cloudflare権限 | 実行境界 |
|---|---|---|
| Pages設定修正 | Pages Write（UIのEdit）を同じ1アカウントのみ | 別Environment `cloudflare-write`、別Secret `CF_PAGES_WRITE_TOKEN`。main限定、Required reviewer、管理者によるbypassを無効化。変更ごとに人間が承認 |
| Web Analyticsサイト作成 | 公式APIではAccount Settings Write | 初回トークンには付けない。この広い権限を常設するより、MCPで必要時承認または人間が一度有効化する経路を比較 |
| 集計値取得 | 対象APIの読み取り権限を改めて調査 | Pages Readから自動的に権限拡大しない。ホスト・期間を固定し、個別訪問情報を公開しない |

書き込み実装は「操作名・対象・変更前の安全な値・変更後の値・レビュー済みコミット」を具体化してから作る。汎用APIプロキシや自由入力PATCHは作らない。GETで前提条件を確認 → 固定フィールドだけPATCH → GETで差分を確認。競合時は停止。削除、課金プラン変更、DNS、セキュリティ設定、環境変数の変更は対象外。ロールバックも前提と影響を提示して承認する。

Web AnalyticsはPagesのbuild_configのweb_analytics_tag/token設定がAPIにあるが、実際の値とサイト作成状態を確認せず自動生成して埋めない。Pagesの再デプロイと実際のbeacon・収集を確認するまで完了としない。Search Console認証はCloudflare APIで代行できない。

## 安全性検証と限界

オフラインテスト: `python3 tests/cloudflare_audit_test.py`。誤アカウント/別GitHubソース、fork/非main/PR実行、不正Account ID、欠けたtoken、HTTPエラー、リダイレクト、巨大応答、API失敗、ネストされたSecret・制御文字を含む応答の非出力を検証。実際のAPIアクセス・Environment設定・tokenの権限は認証後に実証する。

公開リポジトリのActionsログは公開される。この実装は許可した状態値だけを出す。Secret maskingを漏えい防止の唯一の手段にしない。Repositoryのworkflow編集権限を持つ者は別のworkflowでSecretを盗めるため、main変更をレビューし、可能ならbranch rulesを設定する。Environmentのmain限定もトークンのアカウント制限も、悪意あるmain変更まで防ぐ仕組みではない。

トークン漏えいの疑いがあればCloudflareで失効 → GitHubのSecretを置換 → ログと変更履歴を点検。ログ削除だけで失効の代わりにしない。GPTはSecretの内容を読む権限を必要としない。

## 費用と資料

公開リポジトリのGitHub標準ホストランナーは無料。3分上限の手動読み取りから開始し、large runner、self-hosted runner、外部の有料MCP・LLM API、追加Workerは導入しない。Cloudflare Pagesの無料枠と既存Git連携を利用する。課金に関わる変更は自動で行わない。

- Cloudflare公式MCP: https://github.com/cloudflare/mcp
- ChatGPT custom MCP: https://developers.openai.com/api/docs/guides/custom-mcp-server
- Pages GET/Pages Read: https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/get/
- Pages PATCH/Pages Write: https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/edit/
- RUM作成/Account Settings Write: https://developers.cloudflare.com/api/resources/rum/subresources/site_info/methods/create/
- GitHub Environment: https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments
- GitHub無料ランナー: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
