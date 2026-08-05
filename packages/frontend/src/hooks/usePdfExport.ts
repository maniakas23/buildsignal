import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PdfExportOptions {
  title: string;
  filename?: string;
  includeTimestamp?: boolean;
}

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = async (data: Record<string, unknown>[], options: PdfExportOptions) => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const { title, filename = "export.pdf", includeTimestamp = true } = options;

      doc.setFontSize(18);
      doc.text(title, 14, 22);

      if (includeTimestamp) {
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      }

      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        const rows = data.map((item) => headers.map((h) => String(item[h] ?? "")));

        autoTable(doc, {
          head: [headers],
          body: rows,
          startY: 40,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [41, 128, 185] },
        });
      }

      doc.save(filename);
      return { success: true };
    } catch (error) {
      console.error("PDF export failed:", error);
      return { success: false, error };
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToPdf, isExporting };
}
