import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

if (typeof Range !== "undefined" && !Range.prototype.getClientRects) {
  Object.defineProperty(Range.prototype, "getClientRects", { configurable: true, value: () => [] });
}
afterEach(cleanup);
