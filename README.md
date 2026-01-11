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

1. **Get OAuth credentials** from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create or use an existing OAuth 2.0 Client ID
   - Download the credentials or copy `client_id` and `client_secret`

2. **Create `.env` file** in the project root:
   ```bash
   cp .env.example .env
   ```

3. **Add your credentials** to `.env`:
   ```bash
   OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
   OAUTH_CLIENT_SECRET=your-client-secret
   ```

4. **Run authentication**:
   ```bash
   # In OpenCode
   ag-login
   ```

5. 表示されたURLをブラウザで開く
6. `localhost:11451` のコールバックが完了すると認証完了

認証情報は `~/.config/opencode/antigravity-auth.json` に保存されます。

## Requirements

- OpenCode v1.0.0+
- `@opencode-ai/plugin` v1.1.7+
- `opencode-antigravity-auth@beta` plugin

## License

MIT
