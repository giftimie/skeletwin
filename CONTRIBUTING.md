# Contributing

Use Node.js 22.23+ or 24.22+ (Node.js 24 recommended) and npm. Run `npm ci`, then `npm run dev` to open the playground. The library lives in `packages/react/src`; the demo consumes its source directly during development.

Before submitting a change, run `npm run check` and `npm run test:e2e`. Install browser binaries once with `npx playwright install`. Browser tests are necessary for geometry: jsdom cannot measure real text or layout. Add a regression test for changes to detection or lifecycle behavior.

Keep the public API small and typed. Do not add runtime dependencies for behavior that the browser or React already provides. Keep React external to package builds, preserve the client boundary, and export CSS separately so applications control stylesheet loading.

For user-visible package changes, run `npm run changeset` and commit the generated file. Choose patch for fixes, minor for compatible features, and major for breaking changes. Do not create changesets for demo-only or internal tooling changes.
