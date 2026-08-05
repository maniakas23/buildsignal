import { useEffect } from "react";

export function AccessibilityInit() {
  useEffect(() => {
    document.documentElement.setAttribute("lang", "en");
  }, []);

  return null;
}
