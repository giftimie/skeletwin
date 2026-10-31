# Skeletwin

Generate a skeleton from your existing React layout. Wrap the content you already have; text lines, images, buttons, and inputs become correctly positioned placeholders.

```sh
npm install @skeletwin/react
```

Requires React 19.3.1 or later in the React 19 line.

```tsx
import { Skeleton } from "@skeletwin/react";
import "@skeletwin/react/styles.css";

function Profile({ user, isLoading }) {
  return (
    <Skeleton loading={isLoading}>
      <article className="profile">
        <img src={user?.avatar} alt="" width={64} height={64} style={{ borderRadius: "50%" }} />
        <h2>{user?.name ?? "Someone wonderful"}</h2>
        <p>{user?.bio ?? "A little room for the story that is on its way."}</p>
      </article>
    </Skeleton>
  );
}
```

## Why measure the DOM?

JSX inspection cannot see what a custom component renders. Skeletwin measures the actual browser layout using text ranges and element rectangles. It supports function and class components, fragments, flexbox, grid, responsive text wrapping, and explicit image dimensions without calling components directly, cloning children, or remounting them.

Children remain mounted in one place throughout loading. Their state, refs, uncontrolled inputs, and effects continue to work. A separate, non-interactive overlay draws the skeleton. Resize and mutation observers update it when the layout or content changes; measurements are batched with `requestAnimationFrame`, and observers disconnect when loading ends.

## API

`Skeleton` accepts standard `div` props, including React 19's `ref` prop.

| Prop             | Type                             | Default      | Purpose                                                             |
| ---------------- | -------------------------------- | ------------ | ------------------------------------------------------------------- |
| `loading`        | `boolean`                        | `true`       | Show the skeleton instead of the content.                           |
| `animation`      | `"shimmer" \| "pulse" \| "none"` | `"shimmer"`  | Choose the animation.                                               |
| `loadingLabel`   | `string`                         | `"Loading…"` | Polite screen reader announcement; `""` silences it.                |
| `baseColor`      | `string`                         | `#e5e7eb`    | Placeholder color.                                                  |
| `highlightColor` | `string`                         | `#f4f5f7`    | Shimmer highlight.                                                  |
| `borderRadius`   | CSS radius or number             | `4px`        | Default radius; numbers use pixels. Media preserves its own radius. |
| `duration`       | `number`                         | `1.6`        | Animation duration in seconds.                                      |

### Fine-tune detection

```tsx
<Skeleton loading={isLoading}>
  <div data-skeleton="circle" style={{ width: 48, height: 48 }} />
  <div data-skeleton="block" className="chart">
    {/* Draw one shape for this subtree. */}
  </div>
  <span data-skeleton="ignore">Decorative content</span>
</Skeleton>;
```

`ignore` omits a subtree from the skeleton; it is still hidden and inert while loading. Use `block` for charts, complex widgets, or CSS artwork, and `circle` for circular placeholders. Images, SVGs, canvases, form controls, background images, and painted empty elements are detected automatically.

### Theme with CSS

```css
.dark-panel {
  --skeleton-base: #283342;
  --skeleton-highlight: #3b485a;
  --skeleton-radius: 6px;
  --skeleton-duration: 1.8s;
}
```

Variables inherit, so you can theme a whole section or one wrapper. Explicit props set the corresponding variable on the wrapper; `style` has final precedence.

## Accessibility and server rendering

While loading, the wrapper has `aria-busy="true"`; the real content is `aria-hidden` and uses native `inert` to prevent focus and interaction. The skeleton overlay is decorative. A persistent status region announces the loading label politely. Both animations respect `prefers-reduced-motion`; forced-color mode uses system colors.

The package exports a `"use client"` boundary for React Server Component frameworks. It is safe to pre-render: the initial server and client markup match, and CSS hides content immediately. Shapes are measured in a layout effect after hydration. The server sends reserved layout space, not measured skeleton shapes. Import the stylesheet in your application's root before rendering.

## Practical constraints

- **Supply the layout.** Empty children produce an empty skeleton. Use representative fallback text and explicit image dimensions or aspect ratios before data arrives. Layout changes between fallback and loaded data can still cause layout shift.
- **Children execute normally.** Effects, requests, image loading, and rendering happen while hidden. This is a loading presentation component, not a Suspense or error boundary. With Suspense, pass a separate representative layout as the fallback.
- **Two block wrappers.** The root is a positioned `div` and its content is a `flow-root` `div`. Apply layout classes to your inner layout or size the root explicitly. Do not insert it where HTML requires a direct `tr`, `li`, or inline child.
- **DOM boundaries.** Portals, shadow DOM, pseudo-element-only content, rotated/skewed transforms, and independently clipped/scrolling widgets are outside automatic detection. Mark a widget `data-skeleton="block"` when its internal layout cannot be represented. Nested skeleton wrappers are treated as single blocks by their parent.
- **Layout observation.** Content mutations, element resizing, font loading, image loading, scrolling, and viewport resizing trigger updates. Pure CSS position animations and stylesheet-only changes that do not resize an observed element are not tracked continuously.
- **Use current browsers.** The package targets evergreen browsers with native `inert`, `ResizeObserver`, and `MutationObserver`. Its supported React version is 19.3.1 or later in the React 19 line.

## Repository

```text
packages/react/       Published component, CSS, declarations, and unit tests
examples/playground/  Vite + React demo and browser fixtures
tests/browser/        Chromium, Firefox, and WebKit integration tests
scripts/              Packaging and distribution checks
.changeset/           Semantic versioning and release notes
```

```sh
npm install
npm run dev                       # Interactive demo
npm run check                     # Lint, types, unit tests, builds, package validation
npx playwright install            # Install browser binaries once
npm run test:e2e                  # Real layout, focus, hydration, and responsive tests
npm run pack                      # Build a distributable tarball
npm run publish:dry-run           # Preview the npm publication without publishing
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development and release instructions.

## License

MIT
