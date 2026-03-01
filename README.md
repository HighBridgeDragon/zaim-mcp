# zaim-mcp

Zaim家計簿APIのMCPサーバー。Claude DesktopなどのMCPクライアントからZaimの収支データにアクセスできます。

## 必要なもの

- [Bun](https://bun.sh/) v1.0+
- [Zaim開発者アカウント](https://dev.zaim.net/) — OAuth認証情報の取得に必要

## セットアップ

### 1. インストール

```sh
git clone https://github.com/HighBridgeDragon/zaim-mcp.git
cd zaim-mcp
bun install
bun run prepare
```

### 2. OAuth認証情報の設定

[Zaim Developers](https://dev.zaim.net/)でアプリケーションを登録し、OAuth 1.0aの認証情報を取得します。

```sh
cp .env.example .env
```

`.env`に認証情報を記入:

```
ZAIM_CONSUMER_KEY=your_consumer_key
ZAIM_CONSUMER_SECRET=your_consumer_secret
ZAIM_ACCESS_TOKEN=your_access_token
ZAIM_ACCESS_TOKEN_SECRET=your_access_token_secret
```

### 3. MCPクライアントの設定

Claude Desktopの場合、`claude_desktop_config.json`に追加:

```json
{
  "mcpServers": {
    "zaim": {
      "command": "bun",
      "args": ["run", "start"],
      "cwd": "/path/to/zaim-mcp",
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

## ライセンス

[ISC](LICENSE)
