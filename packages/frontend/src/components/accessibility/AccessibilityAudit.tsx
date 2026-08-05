import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export function AccessibilityAudit() {
  useEffect(() => {
    // Accessibility audit checks
    const issues: string[] = [];
    const images = document.querySelectorAll("img:not([alt])");
    if (images.length > 0) issues.push(`${images.length} images missing alt text`);
    const inputs = document.querySelectorAll("input:not([id])");
    if (inputs.length > 0) issues.push(`${inputs.length} inputs missing id`);
    if (issues.length > 0) console.warn("Accessibility issues:", issues);
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-green-500" />
        <span className="text-sm font-medium">Accessibility Audit</span>
      </div>
      <p className="text-sm text-muted-foreground mt-2">Running accessibility checks...</p>
    </div>
  );
}
