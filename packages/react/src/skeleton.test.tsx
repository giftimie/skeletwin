import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, Fragment, StrictMode, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Skeleton } from "./skeleton";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}

function Label() {
  return <strong>Custom component</strong>;
}

describe("Skeleton", () => {
  it("defaults to a busy skeleton with hidden, inert content and a polite announcement", () => {
    const { container } = render(
      <Skeleton>
        <button type="button">Real content</button>
      </Skeleton>,
    );
    const root = container.querySelector("[data-skeleton-root]");
    expect(root?.getAttribute("aria-busy")).toBe("true");
    expect(root?.getAttribute("data-animation")).toBe("shimmer");
    const content = container.querySelector("[data-skeleton-content]");
    expect(content?.getAttribute("aria-hidden")).toBe("true");
    expect(content?.hasAttribute("inert")).toBe(true);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("Loading…");
  });

  it("reveals content and removes the overlay when loading completes", () => {
    const { rerender, container } = render(
      <Skeleton>
        <a href="/profile">Profile</a>
      </Skeleton>,
    );
    rerender(
      <Skeleton loading={false}>
        <a href="/profile">Profile</a>
      </Skeleton>,
    );
    expect(screen.getByRole("link", { name: "Profile" })).toBeTruthy();
    expect(container.querySelector("[data-skeleton-overlay]")).toBeNull();
    expect(container.querySelector("[data-skeleton-content]")?.hasAttribute("inert")).toBe(false);
    expect(container.querySelector("[data-skeleton-content]")?.hasAttribute("aria-hidden")).toBe(
      false,
    );
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("preserves child state and DOM identity across loading transitions", () => {
    const { rerender } = render(
      <Skeleton loading={false}>
        <Counter />
      </Skeleton>,
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    rerender(
      <Skeleton>
        <Counter />
      </Skeleton>,
    );
    rerender(
      <Skeleton loading={false}>
        <Counter />
      </Skeleton>,
    );
    expect(screen.getByRole("button")).toBe(button);
    expect(button.textContent).toBe("1");
  });

  it("accepts custom components, fragments, empty children, and numbers", () => {
    const { rerender } = render(
      <Skeleton loading={false}>
        <Fragment key="fragment">
          <Label />
          {null}
          {false}
          {42}
        </Fragment>
      </Skeleton>,
    );
    expect(screen.getByText("Custom component")).toBeTruthy();
    expect(screen.getByText("42")).toBeTruthy();
    expect(() => rerender(<Skeleton />)).not.toThrow();
  });

  it("forwards a React 19 ref and standard div attributes", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} id="profile" className="custom" data-testid="wrapper" />);
    expect(ref.current).toBe(screen.getByTestId("wrapper"));
    expect(ref.current?.id).toBe("profile");
    expect(ref.current?.className).toBe("custom");
  });

  it("allows custom and silent announcements", () => {
    const { rerender } = render(<Skeleton loadingLabel="Fetching your profile" />);
    expect(screen.getByRole("status").textContent).toBe("Fetching your profile");
    rerender(<Skeleton loadingLabel="" />);
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("supports theme props, numeric radius, and final style overrides", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Skeleton
        ref={ref}
        baseColor="red"
        highlightColor="pink"
        borderRadius={8}
        duration={2}
        style={{ "--skeleton-base": "blue" } as React.CSSProperties}
      />,
    );
    expect(ref.current?.style.getPropertyValue("--skeleton-base")).toBe("blue");
    expect(ref.current?.style.getPropertyValue("--skeleton-highlight")).toBe("pink");
    expect(ref.current?.style.getPropertyValue("--skeleton-radius")).toBe("8px");
    expect(ref.current?.style.getPropertyValue("--skeleton-duration")).toBe("2s");
  });

  it("clamps negative animation durations", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} duration={-5} animation="none" />);
    expect(ref.current?.style.getPropertyValue("--skeleton-duration")).toBe("0s");
    expect(ref.current?.getAttribute("data-animation")).toBe("none");
  });

  it("disconnects observers and cancels pending frames in StrictMode", () => {
    const disconnect = vi.fn();
    const resize = vi.fn(
      class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = disconnect;
      },
    );
    vi.stubGlobal("ResizeObserver", resize);
    const cancel = vi.spyOn(window, "cancelAnimationFrame");
    const { unmount } = render(
      <StrictMode>
        <Skeleton>
          <span>Content</span>
        </Skeleton>
      </StrictMode>,
    );
    fireEvent.resize(window);
    unmount();
    expect(resize).toHaveBeenCalledTimes(2);
    expect(disconnect).toHaveBeenCalledTimes(2);
    expect(cancel).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("does not allocate layout observers while already loaded", () => {
    const observer = vi.spyOn(window, "MutationObserver");
    render(
      <Skeleton loading={false}>
        <p>Ready</p>
      </Skeleton>,
    );
    expect(observer).not.toHaveBeenCalled();
  });
});
