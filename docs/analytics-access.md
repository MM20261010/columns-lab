# Analytics読み取り経路と最小権限の提案

確認日: 2026-10-11。実施は調査と既存権限の読み取りのみ。再認証、権限追加、トークン発行、Secrets登録は未実施。

## 最新の実測（2026-10-11 JST、以下の以前の未確認状態を更新）

- 既存Pages ReadのOAuthで、Code ExecutorからPOST /graphql、query { __typename } はHTTP 200、Queryを返した。読み取りのschema introspectionも200。OpenAPI searchに一般/graphqlが載っていないことを、Executor非対応と扱わない。
- schemaでaccountのrumPageloadEventsAdaptiveGroups、count、sum.visits、avg.sampleInterval、datetime_geq/datetime_lt、requestHost/siteTagフィルターを確認。これは構造の確認で、集計の読み取り成功ではない。
- 明示した対象Account ID、hostname=columns-lab.pages.dev、2026-10-11T00:00:00Z以上07:00:00Z未満、limit=1の集計queryは、MCPが「GraphQL error: not authorized for that account」とINVALID_ARGUMENTを返した。HTTPステータスはこの失敗応答では非提示。「account_id ... is not one of this session's accounts」も併記された。明示IDのPages GET 200と区別し、未指定の自動選択エラーではないと記録する。権限追加で必ず解決すると断定せず、既存接続のアカウントルーティングも再確認する。
- Visits/PVは不明。追加の権限なしでGraphQL到達/構造は確認できたが、実データは取得できない。APIトークン/Secretsは不要なまま、OAuthのAccount Analytics Read追加候補について本人の判断を待つ。

### 次の本人操作の提案（承認前に行わない）

1. まず「対象アカウント限定のAccount Analytics Readを公式Cloudflare OAuthへ追加する」ことの承認を判断する。認証だけを先にやり直さない。
2. 承認後、既存Cloudflareプラグインの接続管理から権限変更/再接続のOAuth同意画面を本人が開く。画面の呼称は現環境で未確認。権限選択が提供される場合はPages Readを維持し、Account Analytics Readのみ追加、対象アカウントのみ選択。Account Settings Read、Pages Write、All accounts、管理者権限は選ばない。
3. 当該選択がない/広い権限しか選べない場合は同意せず停止して再提案する。チャットに認証コード/トークンを送らない。新規APIトークン/Secretsは今回の提案に含めない。
4. GPTがAccount ID明示で同じhostname/期間に限定した読み取りを1回実行し、errors/空accounts/欠測を検査。画面と同条件で照合できた値だけ記録する。拒否が続く場合はエラーと接続ルーティングを報告し、追加権限を重ねない。

アクセス範囲/リスク: Account Analytics Readは対象アカウントの他の解析データも読める可能性があり、columns-labだけの認可ではない。hostnameフィルターは取得範囲の制限であって権限境界ではない。設定書き込みやCSV収集を目的としない。承認せず既存の最小権限を維持し、本人が必要時のみ集計画面を共有する選択もできる。

検証済みスキーマに基づく設計query（未認可、集計不明。実行時は固定の対象Account IDを非公開の接続文脈から指定）:

```graphql
query MonthlyRUM($account: string!, $start: Time!, $end: Time!) {
  viewer {
    accounts(filter: {accountTag: $account}) {
      rumPageloadEventsAdaptiveGroups(limit: 1, filter: {
        datetime_geq: $start, datetime_lt: $end,
        requestHost: "columns-lab.pages.dev"
      }) { count sum { visits } avg { sampleInterval } }
    }
  }
}
```

日本時間の月境界をUTCへ変換する。取得可能期間/プラン制限をsettingsで確認してから分割し、重複しない区間にする。countのPVとしての解釈、サンプリングの扱いは実データと公式画面で照合する。HTTPリクエスト数や実人数の代用にしない。生URL/参照元一覧は取得・保存しない。

## 確認できた範囲

| 対象 | 必要な読み取り権限（公式資料） | 現状 |
| --- | --- | --- |
| GET /accounts/{account_id}/pages/projects/columns-lab | Pages Read | 明示Account IDで200。Git接続・本番成功・Analytics設定を確認 |
| GET /accounts/{account_id}/rum/site_info/list | Account Settings Read | 現行権限で取得できず。設定一覧でありPV集計ではない |
| アカウント単位のGraphQL Analytics | Account → Account Analytics → Read | GraphQL到達/schemaは200、RUM集計は明示Accountで認可拒否。最新の実測参照 |

Pages GETはプロジェクト設定・デプロイ情報を読むもので、Visits/PVの集計APIではない。返却設定にはenv_varsなどが含まれ得るので、出力項目を許可リストで絞る。

RUM一覧の既存試行は「Cloudflare API error: 10000: Authentication error」、MCP error_code=INVALID_ARGUMENT、HTTPステータス非提示。明示IDによるPages GET成功とは区別する。HTTP 403と断定せず、権限不足と接続側のアカウント判定の両方を切り分ける。再認証ループはしない。

## 推奨順と承認が必要な内容

1. 追加権限なし: 本人が閲覧可能なWeb Analytics集計の期間・タイムゾーン・Visits・PVを共有する場合だけ、GPTが記録できる。日々の自動取得はできないが安全な継続手段。
2. 自動取得を希望する場合の最小候補は、対象アカウントだけの **Account Analytics Read**。Pages Write、Account Settings Write、Zone Write、管理者権限は不要。RUM一覧のためだけにAccount Settings Readを追加しない。現在のPagesメタデータで得られるサイト識別情報を内部で利用できるか先に確認する。
3. 先にMCPの対応仕様を確認。公式MCPはOAuthを提供し、このWork接続でGraphQL到達/schemaを確認済み。RUM集計は現行権限で拒否されている。追加OAuthだけで自動取得が完成すると約束しない。OAuthの画面でAccount Analytics Readと対象アカウントのみを選択できることを確認し、広すぎる選択しかない場合は中止して再提案する。承認後に本人が認証する。
4. MCPが対応しない場合のみ、別の読み取り専用GitHub Actions案をPRで提示。承認後、本人がカスタムAPIトークンを対象アカウントのAccount Analytics Readだけで作成し、有効期限を設定。トークンはGitHubの保護されたEnvironment Secretに直接登録する。チャットやコミットには渡さない。PR #2はそのままDraft。

追加権限のリスク: 書き換えはできなくても、当該アカウントの他の解析情報まで読める可能性がある。クエリのcolumns-lab限定フィルターは、認証そのもののプロジェクト境界にはならない。本人の承認前に追加しない。

## 承認後の実装・検証設計（今は実行しない）

- GraphQLのエンドポイントは https://api.cloudflare.com/client/v4/graphql 。POSTでもqueryだけを送る読み取り用途。スキーマ/設定を読み、RUMのページロード集計で利用可能なフィルター・PV/Visits項目・期間/件数制限を確認してからクエリを確定する。エッジHTTPリクエスト数をWeb Analytics PVの代用にしない。
- 対象Account、site/hostname、開始以上・終了未満の時刻で限定。集計のVisitsは実人数ではない。公式指標の定義と画面を照合する。サンプリング・保持期間・遅延・広告ブロック等の欠測を保存する。
- HTTP成功だけで完了にせず、GraphQL errors、空のaccounts、期間外、集計未反映を判定。同一条件の管理画面との照合が終わるまでは実装を完成扱いしない。
- Actionsなら最初はworkflow_dispatch、secretsなしのPRでは実行しない。pull_request_targetは使わず、外部PRやユーザーCSVを実行入力にしない。権限contents: read、アクションは確認済みコミットに固定、トークンをログ/例外/成果物へ出さない。生レスポンス・URL/参照元一覧を保存せず、ホスト固定の集計値だけを返す。
- 自動コミット権限を同時に加えない。取得結果の手動/既存GPT経路での記録から始める。実行時間・保存期間を限定し無料枠を確認。スケジュール有効化は別途承認。失敗時は欠測とし、過去値・0で補わない。
- 停止・復旧はワークフロー停止/トークン失効。期限前更新も本人がSecretsへ直接登録。不要な権限は除去し、無期限の広いトークンを作らない。

## 公式根拠

- Pages GET / accepted permissions: https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/get/
- RUM一覧 / Account Settings Read: https://developers.cloudflare.com/api/resources/rum/subresources/site_info/methods/list/
- Analyticsトークン / Account Analytics Read: https://developers.cloudflare.com/analytics/graphql-api/getting-started/authentication/api-token-auth/
- 公式MCP/OAuth: https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/
- Web AnalyticsとGraphQL・サンプリング: https://developers.cloudflare.com/web-analytics/faq/
- 指標定義: https://developers.cloudflare.com/web-analytics/data-metrics/high-level-metrics/
- 実行制限の確認: https://developers.cloudflare.com/analytics/graphql-api/features/discovery/settings/
