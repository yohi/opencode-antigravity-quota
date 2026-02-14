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

### Basic Setup (Zero Configuration)

Usually, no additional configuration is required. This plugin automatically uses the authentication information from `opencode-antigravity-auth` (stored in `~/.config/opencode/antigravity-accounts.json`).

Just install the plugin and it works!

### Advanced Setup: Precise Quota Monitoring

To display accurate quota usage (especially for Claude) directly from the Google Cloud API, you need to set up OAuth credentials. Without this, the plugin may rely on local estimation or partial data.

#### 1. Setup OAuth Credentials

Create an OAuth 2.0 Client ID in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
- Create OAuth 2.0 Client ID
- Copy `client_id` and `client_secret`

#### 2. Create Environment File

Create `~/.config/opencode/antigravity-quota.env` (Recommended):

```bash
nano ~/.config/opencode/antigravity-quota.env
```

Add your credentials:
```bash
OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
OAUTH_CLIENT_SECRET=your-client-secret
```

The plugin will automatically pick up these credentials and use your existing authentication token to fetch precise quota details.

### Troubleshooting / Manual Login (`ag-login`)

If you experience authentication issues or want to force a specific account for quota checking, you can use the manual login command.

**Note:** This is usually **not required**.

```bash
ag-login
```

1. Open the displayed URL in your browser.
2. Authenticate with your Google account.
3. Wait for the callback at `localhost:11451`.

This will generate `~/.config/opencode/antigravity-auth.json`, which takes precedence over the default account settings.

#### "OAuth credentials not found" Error

Check if the environment file exists at `~/.config/opencode/antigravity-quota.env` and has the correct format:

```bash
# Correct
OAUTH_CLIENT_ID=123456.apps.googleusercontent.com
OAUTH_CLIENT_SECRET=GOCSPX-abc123

# Incorrect (no quotes needed)
OAUTH_CLIENT_ID="123456.apps.googleusercontent.com"
```

## Requirements

- OpenCode v1.0.0+
- `@opencode-ai/plugin` v1.1.7+
- `opencode-antigravity-auth@beta` plugin

## License

MIT
