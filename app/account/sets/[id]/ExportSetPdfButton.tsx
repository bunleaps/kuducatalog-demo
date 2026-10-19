"use client";

import { FileDown } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "../../../../components/ui/button";

type ExportItem = { title: string; category: string; availability: string; quantity: number };

export default function ExportSetPdfButton({ title, createdAt, items }: { title: string; createdAt: string; items: ExportItem[] }) {
  function exportPdf() {
    const document = new jsPDF({ format: "a4", unit: "pt" });
    const pageWidth = document.internal.pageSize.getWidth();
    const created = new Date(createdAt).toLocaleDateString();
    const generated = new Date().toLocaleDateString();

    document.setFillColor(15, 23, 42);
    document.rect(0, 0, pageWidth, 106, "F");
    document.setTextColor(255, 255, 255);
    document.setFont("helvetica", "bold");
    document.setFontSize(18);
    document.text("RENT4SET", 48, 52);
    document.setFont("helvetica", "normal");
    document.setFontSize(10);
    document.text("Project equipment list", 48, 74);

    document.setTextColor(15, 23, 42);
    document.setFont("helvetica", "bold");
    document.setFontSize(24);
    document.text(title, 48, 148, { maxWidth: pageWidth - 96 });
    document.setFont("helvetica", "normal");
    document.setFontSize(10);
    document.setTextColor(100, 116, 139);
    document.text("Created " + created + "  |  Exported " + generated, 48, 174);

    autoTable(document, {
      startY: 204,
      head: [["#", "Equipment", "Category", "Availability", "Qty"]],
      body: items.map((item, index) => [String(index + 1), item.title, item.category, item.availability, String(item.quantity)]),
      theme: "plain",
      margin: { left: 48, right: 48 },
      styles: { cellPadding: 10, font: "helvetica", fontSize: 9, textColor: [30, 41, 59] },
      headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 0: { cellWidth: 28 }, 4: { cellWidth: 34, halign: "center" } },
      didDrawPage: () => {
        const pageHeight = document.internal.pageSize.getHeight();
        document.setDrawColor(226, 232, 240);
        document.line(48, pageHeight - 48, pageWidth - 48, pageHeight - 48);
        document.setTextColor(100, 116, 139);
        document.setFontSize(8);
        document.text("RENT4SET - Equipment list", 48, pageHeight - 30);
        document.text("Page " + document.getNumberOfPages(), pageWidth - 82, pageHeight - 30);
      },
    });

    const fileName = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "project-set";
    document.save("rent4set-" + fileName + ".pdf");
  }

  return <Button variant="outline" onClick={exportPdf}><FileDown size={15} />Export PDF</Button>;
}
