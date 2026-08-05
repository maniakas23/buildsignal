import { useEffect } from "react";

export function useAnalytics() {
  useEffect(() => {
    // Analytics initialization placeholder
    // In production, integrate with Segment, Mixpanel, or similar
    const initAnalytics = () => {
      console.log("Analytics initialized");
    };

    initAnalytics();
  }, []);

  const trackEvent = (event: string, properties?: Record<string, unknown>) => {
    // In production, send to analytics service
    console.log("Track event:", event, properties);
  };

  const trackPageView = (page: string) => {
    trackEvent("page_view", { page });
  };

  return { trackEvent, trackPageView };
}
