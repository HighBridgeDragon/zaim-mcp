# zaim-mcp

Zaim家計簿APIの**非公式**MCPサーバー。Claude DesktopなどのMCPクライアントからZaimの収支データにアクセスできます。

> **Note**: 本プロジェクトは[Zaim](https://zaim.net/)公式のものではなく、個人が開発・運営しています。

## 必要なもの

- [Node.js](https://nodejs.org/) v24+
- [Zaim開発者アカウント](https://dev.zaim.net/) — OAuth認証情報の取得に必要

## セットアップ

### 1. Zaim APIの認証情報を取得

[Zaim Developers](https://dev.zaim.net/)でアプリケーションを登録し、Consumer Key / Consumer Secret を取得します。

### 2. セットアップウィザードを実行

```sh
npx -y @highbridgedragon/zaim-mcp init
```

ウィザードが以下を案内します:

1. Consumer Key / Consumer Secret の入力
2. ブラウザでZaimにログインし、アクセストークンを取得
3. 利用するMCPクライアント（Claude Desktop、Claude Code、Cursor、Windsurf、VS Code）を選択
4. 設定ファイルへの自動書き込み

セットアップ完了後、MCPクライアントを再起動すれば利用開始できます。

### 手動設定

ウィザードを使わず手動で設定する場合、MCPクライアントの設定ファイルに以下を追加してください。

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "zaim": {
      "command": "npx",
      "args": ["-y", "@highbridgedragon/zaim-mcp"],
      "env": {
        "ZAIM_CONSUMER_KEY": "...",
        "ZAIM_CONSUMER_SECRET": "...",
        "ZAIM_ACCESS_TOKEN": "...",
        "ZAIM_ACCESS_TOKEN_SECRET": "..."
      }
    }
  }
}
```

> Windows の場合は `"command": "cmd"`, `"args": ["/c", "npx", "-y", "@highbridgedragon/zaim-mcp"]` に置き換えてください。

## 利用可能なツール

| ツール | 説明 |
|--------|------|
| `zaim_verify` | 認証状態を確認し、ユーザー情報を返す |
| `zaim_get_money` | 収支記録を取得（日付・カテゴリ・種別でフィルタ可能） |
| `zaim_get_categories` | ユーザーのカテゴリ一覧を取得 |
| `zaim_get_genres` | ユーザーのジャンル一覧を取得 |
| `zaim_get_accounts` | ユーザーの口座一覧を取得 |
| `zaim_get_default_categories` | デフォルトカテゴリ一覧を取得 |
| `zaim_get_currencies` | 利用可能な通貨一覧を取得 |

## 開発

開発にはBunが必要です。

```sh
git clone https://github.com/HighBridgeDragon/zaim-mcp.git
cd zaim-mcp
bun install
bun run prepare
```

```sh
bun run start         # MCPサーバー起動
bun run test          # ユニットテスト
bun run check         # lint + format + typecheck
```

## ライセンス

[ISC](LICENSE)
