# opencode-antigravity-quota

OpenCode TUI plugin to display Antigravity rate limit status after each tool execution.

## Features

- Displays rate limit status for Claude, Gemini Pro, and Gemini Flash models
- Compact format: `[AG] Claude:✅ | Pro:⏳12m | Flash:✅`
- Only shows when rate limits are active
- Reads from `~/.config/opencode/antigravity-accounts.json`

## Installation

The repository includes pre-built files in `dist/`, so **no build step is required** for any installation method.

### Option 1: Local Clone with file:// (Recommended)

Clone to your OpenCode config directory:

```bash
git clone https://github.com/yohi/opencode-antigravity-quota ~/.config/opencode/opencode-antigravity-quota
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
    "opencode-antigravity-quota@git+https://github.com/yohi/opencode-antigravity-quota"
  ]
}
```

**After OpenCode update:** This format will be fully supported with robust URL parsing and clear error messages.

### Option 3: Local Path

Clone to any location:

```bash
git clone https://github.com/yohi/opencode-antigravity-quota /path/to/opencode-antigravity-quota
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
