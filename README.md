# misskeyniji
もうすぐ始まる「にじさんじ」ライバーの配信をお知らせする Misskey ボット
中学生の頃書いた Twitter ボットを流用したよ
文字列結合が汚いね

## 必要なライブラリ

- Parser
- dayjs

## 必要なトークン

スクリプトプロパティから追加してください。

- misskeyApi
  - Misskey の 「ノートを作成」「ドライブにアップロード」を許可してください。
- spreadSheetId
  - データベースとして使っている雑なスプレッドシートの Id
  - [こんなの](https://docs.google.com/spreadsheets/d/e/2PACX-1vQzj32WoDFknJdCTOM23xu2Cy-6ZSpT3tb03No-EnWV2OR_1nV8M3lD2C72af-GG1fPUDUQ4ZvZmQnK/pubhtml)
