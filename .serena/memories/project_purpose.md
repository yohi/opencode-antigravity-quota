# Project Purpose
The `opencode-antigravity-quota` project is an OpenCode TUI plugin designed to display the Antigravity rate limit status after each tool execution. It provides a compact visual representation of the quota status for different models (Claude, Gemini Pro, Gemini Flash).

# Tech Stack
- **Language**: TypeScript
- **Framework**: OpenCode Plugin System (`@opencode-ai/plugin`)
- **Tools**: TypeScript Compiler (`tsc`)
- **Runtime**: Node.js (via OpenCode TUI)

# Core Features
- Reads account information from `~/.config/opencode/antigravity-accounts.json`.
- Parses rate limit data and formats it into a compact string.
- Hooks into tool execution to display the quota status.
- Support for Claude, Gemini Pro, and Gemini Flash model families.
