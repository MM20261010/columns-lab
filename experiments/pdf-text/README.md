# PDF文章整形：未公開の試作

調査beedd8abを引き継ぐ独立実験。既存CSV/PR9画像ツールのコード・main・本番には組み込んでいない。依存追加/ビルド/登録なし。

## ファイル

- `site/index.html` / `style.css` / `core.js` / `app.js`：ビルド不要の1ページ。
- `site/_headers`：試作用CSP/noindex。既存本番設定へコピーしない。
- `SPEC.md`：改行判定、保持条件、容量、受入条件。
- `tests/cases.json`：25件の合成文章/期待出力。
- `tests/*.test.cjs`：Node標準だけのコア/状態/静的検査。
- `RESULTS-2026-11-01.json`：実行範囲と未検証。

## 自動テスト

リポジトリrootで `node --test experiments/pdf-text/tests/*.test.cjs`。Node24.22.1で45件合格。UI状態検査は小さいDOM/Clipboardダブルであり、実ブラウザ・OSクリップボードの成功証明ではない。

## 次のブラウザQA

Sitesのmanaged preview基盤は今回デーモンmailbox不在で起動できなかった。`sites-preview status`と、静的ディレクトリ設定後の`sites-preview start`が同じ基盤エラー。代替サーバー/公開ホスト/新しいQAサイトは作らない。

基盤復旧後、ローカル作業ディレクトリの`.openai/hosting.json`で`static.directory`を`experiments/pdf-text/site`に設定し、`sites-preview start <absolute-checkout>`が返したURLをそのまま実ブラウザで開く。研究/試作を再実装しない。ホスト配信を伴う別経路には今回のローカル試作の承認を流用しない。

貼付→自動整形→コピー→クリップボード一致、手動修正、原文復元、再整形、リセット、空入力、上限内外、コピー拒否、コピー待ち中の変更を確認。320/360/390px表示とキーボードの操作性は別途実測。Android実機は未検証と明示する。

本番公開、mainマージ、外部投稿は別承認。今回は新しい開発ブランチに保存するだけで、PRは新規作成しない。Cloudflare GraphQL不使用。
