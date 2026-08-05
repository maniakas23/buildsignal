import { useEffect, useRef } from "react";

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

export function usePerformanceMonitor() {
  const metrics = useRef<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

    const observers: PerformanceObserver[] = [];

    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          metrics.current.fcp = entries[0].startTime;
        }
      });
      fcpObserver.observe({ entryTypes: ["paint"] });
      observers.push(fcpObserver);
    } catch {
      // ignore
    }

    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          metrics.current.lcp = lastEntry.startTime;
        }
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
      observers.push(lcpObserver);
    } catch {
      // ignore
    }

    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          metrics.current.fid = (entries[0] as PerformanceEventTiming).processingStart - entries[0].startTime;
        }
      });
      fidObserver.observe({ entryTypes: ["first-input"] });
      observers.push(fidObserver);
    } catch {
      // ignore
    }

    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        metrics.current.cls = clsValue;
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
      observers.push(clsObserver);
    } catch {
      // ignore
    }

    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.current.ttfb = navigation.responseStart;
    }

    return () => {
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  return metrics.current;
}
