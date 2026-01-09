# Code Style and Conventions
- **Language**: TypeScript is used throughout the project.
- **Project Structure**:
    - `src/core`: Core logic for reading accounts and parsing rate limits.
    - `src/hooks`: OpenCode plugin hooks (e.g., tool execution hooks).
    - `src/ui`: Formatting logic for the user interface.
    - `src/index.ts`: Entry point for the plugin.
- **Naming**: camelCase for variables and functions, PascalCase for interfaces and classes.
- **Type Safety**: Strong typing is preferred, avoiding `any` where possible.
- **Configuration**: Uses `package.json` for scripts and dependencies, `tsconfig.json` for TypeScript configuration.
