"use client";

import { type ComponentPropsWithRef, type CSSProperties, useRef } from "react";
import { useSkeleton } from "./use-skeleton";

export interface SkeletonProps extends ComponentPropsWithRef<"div"> {
  /** Show the skeleton. Children stay mounted when this changes. @default true */
  loading?: boolean;
  /** Animation style. Reduced-motion preferences always take precedence. @default "shimmer" */
  animation?: "shimmer" | "pulse" | "none";
  /** Accessible loading announcement. Pass an empty string to silence it. @default "Loading…" */
  loadingLabel?: string;
  /** Skeleton fill color; accepts any CSS color. */
  baseColor?: string;
  /** Shimmer highlight color; accepts any CSS color. */
  highlightColor?: string;
  /** Shape border radius. Numbers are interpreted as pixels. */
  borderRadius?: CSSProperties["borderRadius"];
  /** Animation duration in seconds. @default 1.6 */
  duration?: number;
}

/** Creates a skeleton from the actual layout of its mounted children. Import styles.css once. */
export function Skeleton({
  children,
  loading = true,
  animation = "shimmer",
  loadingLabel = "Loading…",
  baseColor,
  highlightColor,
  borderRadius,
  duration,
  style,
  ...props
}: SkeletonProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const shapes = useSkeleton(contentRef, overlayRef, loading);

  const variables = {
    ...(baseColor !== undefined && { "--skeleton-base": baseColor }),
    ...(highlightColor !== undefined && { "--skeleton-highlight": highlightColor }),
    ...(borderRadius !== undefined && {
      "--skeleton-radius": typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
    }),
    ...(duration !== undefined && { "--skeleton-duration": `${Math.max(0, duration)}s` }),
    ...style,
  } as CSSProperties;

  return (
    <div
      {...props}
      data-skeleton-root=""
      data-loading={loading ? "true" : "false"}
      data-animation={animation}
      aria-busy={loading}
      style={variables}
    >
      <div
        ref={contentRef}
        data-skeleton-content=""
        aria-hidden={loading ? true : undefined}
        inert={loading ? true : undefined}
      >
        {children}
      </div>
      {loading && (
        <div ref={overlayRef} data-skeleton-overlay="" aria-hidden="true">
          {shapes.map((shape, index) => (
            <span
              // Shapes have no state; their order follows DOM reading order.
              // biome-ignore lint/suspicious/noArrayIndexKey: Geometry is a stateless snapshot.
              key={index}
              data-skeleton-shape={shape.kind}
              style={{
                left: shape.x,
                top: shape.y,
                width: shape.width,
                height: shape.height,
                borderRadius: shape.radius,
              }}
            />
          ))}
        </div>
      )}
      <span data-skeleton-status="" role="status" aria-live="polite" aria-atomic="true">
        {loading ? loadingLabel : ""}
      </span>
    </div>
  );
}
