import { Skeleton } from "@skeletwin/react";
import { useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

function StatefulChild() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" data-testid="counter" onClick={() => setCount(count + 1)}>
      Count {count}
    </button>
  );
}

export function Fixture() {
  const [loading, setLoading] = useState(true);
  const [long, setLong] = useState(false);
  const [width, setWidth] = useState(400);
  const [size, setSize] = useState(48);
  const [mounted, setMounted] = useState(true);
  return (
    <main
      style={{
        padding: 30,
        color: "#222",
        background: "white",
        minHeight: "100vh",
        fontFamily: "Arial",
      }}
    >
      <button type="button" onClick={() => setLoading(!loading)}>
        Toggle loading
      </button>
      <button type="button" onClick={() => setLong(!long)}>
        Change content
      </button>
      <button type="button" onClick={() => setWidth(width === 400 ? 180 : 400)}>
        Resize container
      </button>
      <button type="button" onClick={() => setSize(size === 48 ? 80 : 48)}>
        Resize child
      </button>
      <button type="button" onClick={() => setMounted(!mounted)}>
        Toggle mount
      </button>
      <button
        type="button"
        onClick={() => {
          const container = document.createElement("div");
          container.id = "hydrated";
          const node = (
            <Skeleton>
              <p>Server rendered text</p>
            </Skeleton>
          );
          container.innerHTML = renderToString(node);
          document.body.append(container);
          hydrateRoot(container, node);
        }}
      >
        Hydrate
      </button>
      {mounted && (
        <Skeleton
          loading={loading}
          data-testid="fixture-skeleton"
          animation="shimmer"
          style={{ width, marginTop: 20, border: "3px solid transparent", padding: 12 }}
        >
          <section style={{ display: "grid", gap: 16 }}>
            <div
              data-testid="avatar"
              data-skeleton="circle"
              style={{ width: size, height: size, borderRadius: "50%", background: "gray" }}
            />
            <h2 style={{ margin: 0 }}>A custom layout</h2>
            <p data-testid="paragraph" style={{ fontSize: 16, lineHeight: "24px", margin: 0 }}>
              {long
                ? "A much longer passage of text that wraps into several lines so we can verify the skeleton follows actual browser text layout, even when the container becomes narrow or content changes after mounting."
                : "Short text."}
            </p>
            <StatefulChild />
            <input aria-label="Your name" defaultValue="Jamie" />
            <span data-skeleton="ignore" data-testid="ignored">
              Ignore this text entirely
            </span>
            <span style={{ display: "none" }}>Hidden text never measured</span>
            <span style={{ visibility: "hidden" }}>Invisible text never measured</span>
          </section>
        </Skeleton>
      )}
      <input aria-label="After skeleton" data-testid="after" />
    </main>
  );
}
