# opencode-antigravity-quota

OpenCode TUI plugin to display Antigravity rate limit status after each tool execution.

## Features

- Displays rate limit status for Claude, Gemini Pro, and Gemini Flash models
- Compact format: `[AG] Claude:✅ | Pro:⏳12m | Flash:✅`
- Only shows when rate limits are active
- Reads from `~/.config/opencode/antigravity-accounts.json`

## Installation

```bash
# Clone or copy this directory
git clone https://github.com/yohi/opencode-antigravity-quota

# Install dependencies
cd opencode-antigravity-quota
npm install

# Build
npm run build
```

## Configuration

Add to your `~/.config/opencode/opencode.jsonc`:

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
