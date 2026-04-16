# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands.   

```bash
npm run setup       # First-time setup: install deps, generate Prisma client, run migrations
npm run dev         # Start dev server with Turbopack at http://localhost:3000
npm run build       # Production build
npm run lint        # ESLint
npm test            # Run all tests with Vitest
npx vitest run src/path/to/__tests__/file.test.ts  # Run a single test file
npm run db:reset    # Reset and re-run all migrations (destructive)
```

The app runs without an `ANTHROPIC_API_KEY` — it falls back to a `MockLanguageModel` that returns static code.

## Architecture

### Request flow

1. User types a prompt → `ChatInterface` sends `POST /api/chat` with messages + serialized `VirtualFileSystem` nodes.
2. `/api/chat/route.ts` reconstructs the `VirtualFileSystem`, calls `streamText` (Vercel AI SDK) with two tools, and streams back a data response.
3. The client receives tool call events and routes them through `FileSystemContext.handleToolCall`, which mutates the in-memory VFS and increments `refreshTrigger`.
4. `PreviewFrame` detects the refresh, reads all VFS files, runs `createImportMap` to Babel-transform each JS/JSX/TS/TSX file into a blob URL, builds an HTML document with an `<script type="importmap">`, and writes it into a sandboxed `<iframe>` via `srcDoc`.

### Virtual File System

`VirtualFileSystem` (`src/lib/file-system.ts`) is an in-memory tree (no disk I/O). It is instantiated on the client inside `FileSystemContext` and reconstructed from JSON on the server inside the API route for each request. Persistence to the database only happens for authenticated users at stream completion.

### AI tools

Two tools are registered with `streamText`:

- **`str_replace_editor`** (`src/lib/tools/str-replace.ts`) — supports `view`, `create`, `str_replace`, and `insert` commands operating on the server-side VFS instance.
- **`file_manager`** (`src/lib/tools/file-manager.ts`) — supports `rename` and `delete`.

The server-side VFS state after all tool calls is serialized and saved to the `Project.data` column (JSON).

### JSX transformer / preview

`src/lib/transform/jsx-transformer.ts` runs entirely in the browser:
- `transformJSX` uses `@babel/standalone` to compile JSX/TSX to plain JS.
- `createImportMap` transforms all VFS files into blob URLs, maps `react`/`react-dom` to `esm.sh`, resolves `@/` aliases, creates placeholder modules for missing local imports, and maps third-party packages to `https://esm.sh/<package>`.
- `createPreviewHTML` assembles a full HTML document with Tailwind CDN, the import map, and a `loadApp()` bootstrap that dynamically imports the entry point (`/App.jsx` by default).

### Auth

JWT-based sessions via `jose` (`src/lib/auth.ts`). Tokens are stored in an `httpOnly` cookie (`auth-token`). Passwords are hashed with `bcrypt`. The `JWT_SECRET` env var should be set in production; a hardcoded development fallback is used otherwise. Server actions in `src/actions/` use `getSession()` to check authentication.

### Database

Prisma with SQLite (`prisma/dev.db`). Schema has two models: `User` and `Project`. `Project.messages` and `Project.data` store JSON as `String` columns. Projects without a `userId` are anonymous and not persisted beyond the session.
