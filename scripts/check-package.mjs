import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { publint } from "publint";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

const require = createRequire(import.meta.url);
const esm = await import("@skeletwin/react");
const cjs = require("@skeletwin/react");
const metadata = require("@skeletwin/react/package.json");
assert.equal(metadata.name, "@skeletwin/react");
assert.equal(metadata.private, undefined);
assert.equal(metadata.publishConfig.access, "public");
assert.equal(metadata.publishConfig.registry, "https://registry.npmjs.org");
assert.match(
  await readFile(require.resolve("@skeletwin/react/styles.css"), "utf8"),
  /skeletwin-shimmer/,
);
assert.equal(typeof esm.Skeleton, "function");
assert.equal(typeof cjs.Skeleton, "function");
for (const component of [esm.Skeleton, cjs.Skeleton]) {
  const html = renderToString(createElement(component, null, "Packaged component"));
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /Packaged component/);
}
for (const name of ["index.js", "index.cjs"]) {
  const source = await readFile(new URL(`../packages/react/dist/${name}`, import.meta.url), "utf8");
  assert.match(source, /^["']use client["'];/);
}
const result = await publint({
  pkgDir: fileURLToPath(new URL("../packages/react", import.meta.url)),
  level: "warning",
});
assert.deepEqual(result.messages, [], JSON.stringify(result.messages, null, 2));
console.log("Package checks passed: ESM, CommonJS, client boundaries, and publint.");
