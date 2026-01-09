# opencode-antigravity-quota

OpenCode TUI plugin to display Antigravity rate limit status after each tool execution.

## Features

- Displays rate limit status for Claude, Gemini Pro, and Gemini Flash models
- Compact format: `[AG] Claude:✅ | Pro:⏳12m | Flash:✅`
- Only shows when rate limits are active
- Reads from `~/.config/opencode/antigravity-accounts.json`

## Installation

**Option 1: Direct from Git (Recommended)**

Add to your `~/.config/opencode/opencode.jsonc`:

```json
{
  "plugin": [
    "oh-my-opencode",
    "opencode-antigravity-auth@beta",
    "git+https://github.com/yohi/opencode-antigravity-quota"
  ]
}
```

The plugin will be automatically installed on OpenCode startup. No manual cloning or building required.

**Option 2: Local Installation**

```bash
# Clone the repository
git clone https://github.com/yohi/opencode-antigravity-quota
```

Then add to your config:

```json
{
  "plugin": [
    "oh-my-opencode",
    "opencode-antigravity-auth@beta",
    "/path/to/opencode-antigravity-quota"
  ]
}
```

Note: The repository includes pre-built files in `dist/`, so no build step is required.

## Display Format

| Status | Display |
|--------|---------|
| Available | `Model:✅` |
| Rate Limited | `Model:⏳{time}` |

Time format examples:
- `12m` - 12 minutes
- `1h30m` - 1 hour 30 minutes
- `2h` - 2 hours

## Requirements

- OpenCode v1.0.0+
- `@opencode-ai/plugin` v1.1.7+
- `opencode-antigravity-auth@beta` plugin

## License

MIT
