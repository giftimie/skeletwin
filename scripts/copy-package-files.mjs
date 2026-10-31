import { copyFile } from "node:fs/promises";

await Promise.all([
  copyFile(
    new URL("../packages/react/src/styles.css", import.meta.url),
    new URL("../packages/react/dist/styles.css", import.meta.url),
  ),
  copyFile(
    new URL("../README.md", import.meta.url),
    new URL("../packages/react/README.md", import.meta.url),
  ),
  copyFile(
    new URL("../CONTRIBUTING.md", import.meta.url),
    new URL("../packages/react/CONTRIBUTING.md", import.meta.url),
  ),
  copyFile(
    new URL("../LICENSE", import.meta.url),
    new URL("../packages/react/LICENSE", import.meta.url),
  ),
]);
