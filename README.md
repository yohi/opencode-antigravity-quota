# opencode-antigravity-quota

OpenCode TUI plugin to display Antigravity rate limit status after each tool execution.

## Features

- Displays quota percentage for Claude, Gemini Pro, and Gemini Flash models
- Compact format:
  ```
  [AG]
  Claude: 80%🔋
  Pro   : 35%🔋
  Flash : 🪫0%
  ```
- Falls back to rate limit display if the API fails
- Reads from `~/.config/opencode/antigravity-accounts.json`

## Installation

The repository does not commit `dist/`. When installing from source, run `npm ci` and `npm run build`.

### Option 0: GitHub Packages (npm)

Configure `~/.npmrc` with a token that has `read:packages`:

```ini
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
@yohi:registry=https://npm.pkg.github.com
```

Install and add to OpenCode:

```bash
npm install @yohi/opencode-antigravity-quota
```

```json
{
  "plugin": [
    "oh-my-opencode",
    "opencode-antigravity-auth@beta",
    "@yohi/opencode-antigravity-quota"
  ]
}
```

### Option 1: Local Clone with file:// (Recommended)

Clone to your OpenCode config directory:

```bash
git clone https://github.com/yohi/opencode-antigravity-quota ~/.config/opencode/opencode-antigravity-quota
cd ~/.config/opencode/opencode-antigravity-quota
npm ci
npm run build
```

Add to your `~/.config/opencode/opencode.jsonc`:

```json
{
  "plugin": [
    "oh-my-opencode",
    "opencode-antigravity-auth@beta",
    "file://~/.config/opencode/opencode-antigravity-quota"
  ]
}
```

### Option 2: Git URL Method (Experimental / Future)

⚠️ **Current Status:**
- Works in simple cases with current OpenCode versions
- **Full official support coming in a future OpenCode release** with improved parsing
- May fail if URL contains `@` character (e.g., authentication URLs)
- For production use, **Option 1 (file://) is recommended** until the OpenCode update is released

Add to your config:

```json
{
  "plugin": [
    "oh-my-opencode",
    "opencode-antigravity-auth@beta",
    "@yohi/opencode-antigravity-quota@git+https://github.com/yohi/opencode-antigravity-quota"
  ]
}
```

**After OpenCode update:** This format will be fully supported with robust URL parsing and clear error messages.

### Option 3: Local Path

Clone to any location:

```bash
git clone https://github.com/yohi/opencode-antigravity-quota /path/to/opencode-antigravity-quota
cd /path/to/opencode-antigravity-quota
npm ci
npm run build
```

Add to your config:

```json
{
  "plugin": [
    "oh-my-opencode",
    "opencode-antigravity-auth@beta",
    "/path/to/opencode-antigravity-quota"
  ]
}
```

## Display Format

Example output:
```
[AG]
Claude: 80%🔋(↻12m)
Pro   : 35%🔋
Flash : ⏳12m
```

| Status | Display |
|--------|---------|
| Healthy | `Model:80%🔋` |
| Low (<=20%) | `Model:15%⚠️` |
| Empty | `Model:🪫0%` |
| Rate limited (local) | `Model:⏳{time}` |
| Unknown (API error) | `Model:??` |

Time format examples (rate limited):
- `12m` - 12 minutes
- `1h30m` - 1 hour 30 minutes
- `2h` - 2 hours

## Authentication

### ⚠️ Security Warning

**The OAuth client secret was previously hardcoded in this repository and has been exposed.**

**Required Actions:**
1. **Rotate the secret** in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID or regenerate the secret
3. Set up environment variables (see below)

**Never commit `.env` files containing secrets to version control.**

### Setup OAuth Credentials

Claude など API 由来の正確なクォータ表示には OAuth 認証が必要です。

#### 1. OAuth認証情報を取得

[Google Cloud Console](https://console.cloud.google.com/apis/credentials) から OAuth 2.0 Client ID を作成または既存のものを使用:
- OAuth 2.0 Client ID を作成
- `client_id` と `client_secret` をコピー

#### 2. 環境変数ファイルを作成

**npmパッケージとしてインストールした場合** (GitHub Packages):
```bash
nano ~/.config/opencode/antigravity-quota.env
```

**ローカルクローンの場合** (file:// または絶対パス):
```bash
cd ~/.config/opencode/opencode-antigravity-quota
cp .env.example .env
nano .env
```

#### 3. OAuth認証情報を記述

ファイルに以下の内容を記述:
```bash
OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
OAUTH_CLIENT_SECRET=your-client-secret
```

**注意**: 
- npmパッケージの場合: `~/.config/opencode/antigravity-quota.env`
- ローカルクローンの場合: プロジェクトディレクトリの `.env`

#### 4. 認証を実行

OpenCodeで以下のコマンドを実行:
```bash
ag-login
```

1. 表示されたURLをブラウザで開く
2. Googleアカウントで認証
3. `localhost:11451` のコールバックが完了すると認証完了

認証情報は `~/.config/opencode/antigravity-auth.json` に保存されます。

#### トラブルシューティング

**エラー: "OAuth credentials not found"**

環境変数ファイルが正しい場所にあるか確認:
- npmパッケージ: `~/.config/opencode/antigravity-quota.env`
- ローカル: `プロジェクトディレクトリ/.env`

ファイル内容の形式が正しいか確認:
```bash
# 正しい形式
OAUTH_CLIENT_ID=123456.apps.googleusercontent.com
OAUTH_CLIENT_SECRET=GOCSPX-abc123

# 間違った形式（クォートは不要）
OAUTH_CLIENT_ID="123456.apps.googleusercontent.com"
```

## Requirements

- OpenCode v1.0.0+
- `@opencode-ai/plugin` v1.1.7+
- `opencode-antigravity-auth@beta` plugin

## License

MIT
