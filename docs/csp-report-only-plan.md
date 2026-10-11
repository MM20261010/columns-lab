# CSP Report-Only検証案（未適用）

更新日: 2026-10-11 JST。site/_headersは変更しない。強制CSPもReport-Onlyも公開していない。既存CSV・Cloudflare Web Analyticsとの互換性を先に検証する。

## 候補

許可先はソースと実通信の両方で確認してから確定する。現段階の候補ヘッダー:

```text
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
```

- Report-Onlyは違反を報告する仕組みで、攻撃を遮断しない。既存のnosniff/DENY等は維持する。HTTPレスポンスヘッダーで配信し、metaタグのReport-Onlyとして置かない。
- beaconの配信先static.cloudflareinsights.comと、送信先cloudflareinsights.comまたは同一ホストの/cdn-cgi/rumは、実際の動作と現行公式仕様で確認する。必要なら必要な接続先だけを修正。無条件の*、unsafe-inline、unsafe-evalを追加しない。
- report-uri/report-toの新しい外部収集先は設けない。違反レポートがURL等を含む可能性があるため、まず架空データでブラウザーコンソールを観測。既存CloudflareのNEL/report-toヘッダーとは別の設定で、CSPレポートの新規送信先に流用しない。
- inlineイベント/スクリプト/スタイル、Blobダウンロード、ページ遷移、404/確認HTMLも点検。Report-Onlyの無違反だけで強制時の互換性を証明しない。

## 実施順・合格条件

1. 専用検証環境を選び、必要な公開/設定操作の承認を得る。ブランチやPRはCloudflareが自動プレビューする場合があるので、先にpreview branch controlsとcommitの[CF-Pages-Skip]を確認する。未承認の公開をしない。
2. ヘッダーなしの基準動作を架空CSVで記録。タグ1個、ファイル選択/サンプル/結合/設定変更/保存、CSV回帰テストを確認する。
3. Report-Onlyのみを配信。トップ/ツール/ガイド/プライバシー/404をHTTPとChrome/Firefox・実機で確認し、コンソールの違反と必要なoriginを記録。秘密やCSV本文/名前をスクリーンショット・レポートに含めない。
4. 同条件でCSVの列/行/値/保存、beacon送信・受信、Analytics集計反映を確認。beaconタグ存在だけでは互換性試験を完了としない。計測権限がない間は集計照合を未完了にする。
5. 無害なDOM文字列を文字として表示する試験、許可外スクリプト等の遮断を隔離環境の強制ポリシーで検証する。これが未実施なら強制化は未承認のまま。
6. 差分・結果・残存リスク・復旧案を別PRへ提示し、レビュー/承認後に強制化を判断。問題時は当該ヘッダー追加コミットのみをrevertし、既存ヘッダーを外さない。

残る制約: このブラウザー機能だけでは通信ペイロード/受信応答を網羅観測できない。Report-Onlyの実配信・実機・Analytics集計照合・強制時の試験は未完了。

根拠:
- https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
- https://developers.cloudflare.com/web-analytics/get-started/
- https://developers.cloudflare.com/pages/configuration/headers/
- https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/
