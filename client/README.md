# Statement Import client

Bare React Native + TypeScript client for the local candidate kit. See [the root README](../README.md) for how to run and verify it.

- `src/packages/statementImport/core` holds the import flow as plain TypeScript with injected dependencies.
- `src/packages/statementImport/platform` holds the native adapters: picker, files, upload, storage.
- `src/packages/statementImport/components` and `src/app/screens/Main` hold the UI.
- `test/core` runs the real flow over HTTP against the unmodified `kit/` server; `test/ui` checks what the status screen claims.
