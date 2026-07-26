"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Tracks an element's live content size via ResizeObserver (not just clientWidth/
 * clientHeight on mount — that reads 0 for elements mounted while hidden, e.g.
 * behind a `hidden` class on an inactive tab view).
 */
export function useContainerWidth<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    setWidth(el.clientWidth);
    setHeight(el.clientHeight);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setWidth(entry.contentRect.width);
      setHeight(entry.contentRect.height);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return { ref, width, height };
}
