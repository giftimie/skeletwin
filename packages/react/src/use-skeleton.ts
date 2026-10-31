import { type RefObject, useLayoutEffect, useState } from "react";
import { measure, type Shape } from "./measure";

export function useSkeleton(
  contentRef: RefObject<HTMLDivElement | null>,
  overlayRef: RefObject<HTMLDivElement | null>,
  loading: boolean,
): Shape[] {
  const [shapes, setShapes] = useState<Shape[]>([]);

  useLayoutEffect(() => {
    const content = contentRef.current;
    const overlay = overlayRef.current;
    const view = content?.ownerDocument.defaultView;
    if (!loading || !content || !overlay || !view) return;

    let disposed = false;
    let frame: number | undefined;
    const update = () => {
      frame = undefined;
      if (disposed) return;
      const next = measure(content, overlay);
      setShapes((previous) => (sameShapes(previous, next) ? previous : next));
    };
    const schedule = () => {
      if (!disposed && frame === undefined) frame = view.requestAnimationFrame(update);
    };

    const resize =
      typeof view.ResizeObserver === "function" ? new view.ResizeObserver(schedule) : null;
    const observed = new Set<Element>();
    const observeElements = () => {
      if (!resize) return;
      const current = new Set<Element>([content, ...content.querySelectorAll("*")]);
      for (const element of observed) {
        if (!current.has(element)) {
          resize.unobserve(element);
          observed.delete(element);
        }
      }
      for (const element of current) {
        if (!observed.has(element)) {
          resize.observe(element);
          observed.add(element);
        }
      }
    };
    const mutations = new view.MutationObserver(() => {
      observeElements();
      schedule();
    });

    update();
    observeElements();
    mutations.observe(content, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });
    view.addEventListener("resize", schedule);
    // Capturing scroll also catches scrollable descendants whose text moves within the wrapper.
    content.addEventListener("scroll", schedule, true);
    content.addEventListener("load", schedule, true);
    const fonts = content.ownerDocument.fonts;
    fonts?.addEventListener("loadingdone", schedule);
    void fonts?.ready.then(schedule);

    return () => {
      disposed = true;
      if (frame !== undefined) view.cancelAnimationFrame(frame);
      mutations.disconnect();
      resize?.disconnect();
      view.removeEventListener("resize", schedule);
      content.removeEventListener("scroll", schedule, true);
      content.removeEventListener("load", schedule, true);
      fonts?.removeEventListener("loadingdone", schedule);
    };
  }, [loading, contentRef, overlayRef]);

  return shapes;
}

function sameShapes(previous: Shape[], next: Shape[]): boolean {
  return (
    previous.length === next.length &&
    previous.every((shape, index) => {
      const other = next[index];
      return (
        other !== undefined &&
        shape.x === other.x &&
        shape.y === other.y &&
        shape.width === other.width &&
        shape.height === other.height &&
        shape.radius === other.radius &&
        shape.kind === other.kind
      );
    })
  );
}
