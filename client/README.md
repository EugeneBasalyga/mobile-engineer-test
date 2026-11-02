# Statement Import client

Bare React Native + TypeScript client for the local candidate kit. See [the root README](../README.md) for how to run and verify it.

- `src/packages/statementImport/services` holds the import flow as a plain class with injected repositories.
- `src/packages/statementImport/repositories` holds server access, native file work and upload, and operation storage.
- `src/packages/statementImport/components` and `src/app/screens/Main` hold the UI.
- `test/core` runs the real flow over HTTP against the unmodified `kit/` server; `test/ui` checks what the status screen claims.
