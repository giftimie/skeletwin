// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./skeleton";

describe("server rendering", () => {
  it("renders loading markup without browser globals or layout reads", () => {
    const html = renderToString(
      <Skeleton>
        <p>Server content</p>
      </Skeleton>,
    );
    expect(html).toContain("Server content");
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('inert=""');
    expect(html).not.toContain("data-skeleton-shape");
  });

  it("renders loaded content without an overlay", () => {
    const html = renderToString(
      <Skeleton loading={false}>
        <p>Already ready</p>
      </Skeleton>,
    );
    expect(html).toContain('aria-busy="false"');
    expect(html).not.toContain("data-skeleton-overlay");
    expect(html).not.toContain("inert=");
  });
});
