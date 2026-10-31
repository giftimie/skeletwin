export interface Shape {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: string;
  kind: "text" | "block";
}

const replaced = new Set([
  "IMG",
  "SVG",
  "CANVAS",
  "VIDEO",
  "AUDIO",
  "IFRAME",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "BUTTON",
  "PROGRESS",
  "METER",
  "HR",
  "OBJECT",
  "EMBED",
]);
const skipped = new Set(["SCRIPT", "STYLE", "LINK", "META", "TEMPLATE", "NOSCRIPT", "BR", "WBR"]);

/** Read-only layout pass. The browser handles custom components, fonts, wrapping, and layout. */
export function measure(content: HTMLElement, overlay: HTMLElement): Shape[] {
  const doc = content.ownerDocument;
  const view = doc.defaultView;
  if (!view) return [];

  const origin = overlay.getBoundingClientRect();
  // Translate viewport coordinates into local CSS pixels, including axis-aligned scale transforms.
  const scaleX = origin.width && overlay.offsetWidth ? overlay.offsetWidth / origin.width : 1;
  const scaleY = origin.height && overlay.offsetHeight ? overlay.offsetHeight / origin.height : 1;
  const shapes: Shape[] = [];

  function add(rect: DOMRect, kind: Shape["kind"], radius: string, fontSize = 0) {
    if (rect.width <= 0 || rect.height <= 0) return;
    const height = kind === "text" ? Math.min(rect.height, fontSize * 0.8) : rect.height;
    shapes.push({
      x: (rect.left - origin.left) * scaleX,
      y: (rect.top - origin.top + (rect.height - height) / 2) * scaleY,
      width: rect.width * scaleX,
      height: height * scaleY,
      radius,
      kind,
    });
  }

  const visit = (node: Node) => {
    if (node.nodeType === 3) {
      const value = node.textContent ?? "";
      if (!value.trim() || !node.parentElement) return;
      const css = view.getComputedStyle(node.parentElement);
      if (css.visibility === "hidden" || css.visibility === "collapse") return;
      const fontSize = Number.parseFloat(css.fontSize) || 16;
      const range = doc.createRange();
      range.setStart(node, value.length - value.trimStart().length);
      range.setEnd(node, value.trimEnd().length);
      for (const rect of range.getClientRects()) {
        add(rect, "text", "var(--skeleton-radius, 4px)", fontSize);
      }
      return;
    }
    if (node.nodeType !== 1) return;

    const element = node as HTMLElement;
    const marker = element.getAttribute("data-skeleton");
    if (marker === "ignore" || skipped.has(element.tagName) || element.hidden) return;
    const css = view.getComputedStyle(element);
    if (css.display === "none" || css.contentVisibility === "hidden" || css.opacity === "0") return;

    const atomic =
      marker === "block" ||
      marker === "circle" ||
      replaced.has(element.tagName.toUpperCase()) ||
      element.hasAttribute("data-skeleton-root") ||
      Boolean(css.backgroundImage && css.backgroundImage !== "none");
    const paintedLeaf =
      element.childNodes.length === 0 &&
      (Boolean(
        css.backgroundColor &&
          css.backgroundColor !== "rgba(0, 0, 0, 0)" &&
          css.backgroundColor !== "transparent",
      ) ||
        Number.parseFloat(css.borderTopWidth) > 0);

    if (atomic || paintedLeaf) {
      if (css.visibility === "hidden" || css.visibility === "collapse") return;
      const radius =
        marker === "circle"
          ? "50%"
          : css.borderRadius && css.borderRadius !== "0px"
            ? css.borderRadius
            : "var(--skeleton-radius, 4px)";
      for (const rect of element.getClientRects()) add(rect, "block", radius);
      return;
    }
    for (const child of element.childNodes) visit(child);
  };

  for (const child of content.childNodes) visit(child);
  return shapes;
}
