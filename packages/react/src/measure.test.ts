import { describe, expect, it, vi } from "vitest";
import { measure } from "./measure";

function fixture(html: string) {
  const content = document.createElement("div");
  content.innerHTML = html;
  document.body.append(content);
  const overlay = document.createElement("div");
  document.body.append(overlay);
  vi.spyOn(overlay, "getBoundingClientRect").mockReturnValue(new DOMRect(10, 20, 400, 300));
  return { content, overlay };
}

describe("layout measurement", () => {
  it("creates a separate placeholder for every wrapped text line", () => {
    const { content, overlay } = fixture("<p style='font-size:20px'>Two lines of text</p>");
    vi.spyOn(Range.prototype, "getClientRects").mockReturnValue([
      new DOMRect(20, 30, 180, 24),
      new DOMRect(20, 60, 80, 24),
    ] as unknown as DOMRectList);
    const shapes = measure(content, overlay);
    expect(shapes).toHaveLength(2);
    expect(shapes[0]).toMatchObject({ x: 10, y: 14, width: 180, height: 16, kind: "text" });
    expect(shapes[1]).toMatchObject({ x: 10, y: 44, width: 80, height: 16 });
  });

  it("preserves media geometry and border radius", () => {
    const { content, overlay } = fixture("<img alt='' style='border-radius:12px' />");
    const image = content.querySelector("img");
    if (!image) throw new Error("Missing fixture image");
    vi.spyOn(image, "getClientRects").mockReturnValue([
      new DOMRect(30, 50, 60, 80),
    ] as unknown as DOMRectList);
    expect(measure(content, overlay)).toEqual([
      { x: 20, y: 30, width: 60, height: 80, radius: "12px", kind: "block" },
    ]);
  });

  it("treats explicit blocks as atomic and circles as circular", () => {
    const { content, overlay } = fixture(
      "<div data-skeleton='circle'><span>Inner text</span></div>",
    );
    const element = content.firstElementChild;
    if (!element) throw new Error("Missing fixture element");
    vi.spyOn(element, "getClientRects").mockReturnValue([
      new DOMRect(10, 20, 48, 48),
    ] as unknown as DOMRectList);
    const range = vi.spyOn(Range.prototype, "getClientRects");
    expect(measure(content, overlay)[0]).toMatchObject({ radius: "50%", width: 48, height: 48 });
    expect(range).not.toHaveBeenCalled();
  });

  it("skips ignored, hidden, unpainted, and whitespace-only subtrees", () => {
    const { content, overlay } = fixture(
      "<div data-skeleton='ignore'>Ignored</div><div hidden>Hidden</div><div style='display:none'>CSS hidden</div><div style='opacity:0'>Invisible</div><div style='visibility:hidden'>Also invisible</div><script>script</script><div></div>   ",
    );
    const range = vi.spyOn(Range.prototype, "getClientRects");
    expect(measure(content, overlay)).toEqual([]);
    expect(range).not.toHaveBeenCalled();
  });

  it("does not create shapes for zero-sized elements", () => {
    const { content, overlay } = fixture("<button>Not laid out</button>");
    expect(measure(content, overlay)).toEqual([]);
  });

  it("converts scaled viewport coordinates back to local CSS pixels", () => {
    const { content, overlay } = fixture("<input />");
    Object.defineProperty(overlay, "offsetWidth", { value: 200 });
    Object.defineProperty(overlay, "offsetHeight", { value: 150 });
    const input = content.querySelector("input");
    if (!input) throw new Error("Missing input");
    vi.spyOn(input, "getClientRects").mockReturnValue([
      new DOMRect(30, 60, 100, 40),
    ] as unknown as DOMRectList);
    expect(measure(content, overlay)[0]).toMatchObject({ x: 10, y: 20, width: 50, height: 20 });
  });
});
