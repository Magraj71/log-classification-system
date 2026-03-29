"use client";

import { FiDownload, FiFileText, FiDatabase } from "react-icons/fi";
import { useState } from "react";

/**
 * Export buttons component for CSV, JSON, and PDF export
 * @param {{ data: object|array, filename: string, title: string }} props
 */
export default function ExportButtons({ data, filename = "log-report", title = "Analysis Report" }) {
  const [exporting, setExporting] = useState("");

  const exportJSON = () => {
    setExporting("json");
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      downloadBlob(blob, `${filename}.json`);
    } finally {
      setTimeout(() => setExporting(""), 500);
    }
  };

  const exportCSV = () => {
    setExporting("csv");
    try {
      let csvContent = "";

      if (Array.isArray(data)) {
        // Array of objects → table
        if (data.length === 0) return;
        const headers = Object.keys(data[0]);
        csvContent = headers.join(",") + "\n";
        for (const row of data) {
          csvContent += headers.map(h => {
            const val = row[h];
            const str = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
            return `"${str.replace(/"/g, '""')}"`;
          }).join(",") + "\n";
        }
      } else {
        // Single object → key-value pairs
        csvContent = "Field,Value\n";
        for (const [key, value] of Object.entries(data)) {
          const str = typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
          csvContent += `"${key}","${str.replace(/"/g, '""')}"\n`;
        }
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      downloadBlob(blob, `${filename}.csv`);
    } finally {
      setTimeout(() => setExporting(""), 500);
    }
  };

  const exportPDF = async () => {
    setExporting("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.setTextColor(16, 185, 129); // emerald
      doc.text(title, 20, 25);

      // Timestamp
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);

      // Separator
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 40, 190, 40);

      let y = 50;
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59); // slate-800

      const addSection = (label, content) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(12);
        doc.setTextColor(16, 185, 129);
        doc.text(label, 20, y);
        y += 8;
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);

        const text = typeof content === "object" ? JSON.stringify(content, null, 2) : String(content ?? "");
        const lines = doc.splitTextToSize(text, 170);
        for (const line of lines) {
          if (y > 280) { doc.addPage(); y = 20; }
          doc.text(line, 20, y);
          y += 5;
        }
        y += 5;
      };

      if (Array.isArray(data)) {
        // For array data (bulk results)
        addSection("Summary", `Total entries: ${data.length}`);
        for (let i = 0; i < Math.min(data.length, 30); i++) {
          addSection(`Entry ${i + 1}`, data[i]);
        }
      } else {
        // For single analysis
        if (data.errorSummary) addSection("Error Summary", data.errorSummary);
        if (data.category) addSection("Category", `${data.category} (${data.confidence}% confidence)`);
        if (data.severity) addSection("Severity", `${data.severity.emoji} ${data.severity.level} (Score: ${data.severity.score}/10)`);
        if (data.rootCause) addSection("Root Cause", data.rootCause);
        if (data.resolutionSteps) addSection("Resolution Steps", data.resolutionSteps.map((s, i) => `${i + 1}. ${s}`).join("\n"));
        if (data.correctedCode) addSection("Corrected Code", data.correctedCode);
        if (data.classifiers) {
          const table = data.classifiers.map(c => `${c.icon} ${c.method}: ${c.category} (${c.confidence}%, ${c.timeMs}ms)`).join("\n");
          addSection("Classifier Comparison", table);
        }
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`LogClassify AI Report — Page ${i} of ${pageCount}`, 20, 290);
      }

      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
    } finally {
      setTimeout(() => setExporting(""), 500);
    }
  };

  const downloadBlob = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const btnBase = "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border shadow-sm";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={exportJSON}
        disabled={!!exporting}
        className={`${btnBase} bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300`}
      >
        <FiDatabase className="w-3.5 h-3.5" />
        {exporting === "json" ? "Exporting..." : "JSON"}
      </button>
      <button
        onClick={exportCSV}
        disabled={!!exporting}
        className={`${btnBase} bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300`}
      >
        <FiFileText className="w-3.5 h-3.5" />
        {exporting === "csv" ? "Exporting..." : "CSV"}
      </button>
      <button
        onClick={exportPDF}
        disabled={!!exporting}
        className={`${btnBase} bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300`}
      >
        <FiDownload className="w-3.5 h-3.5" />
        {exporting === "pdf" ? "Generating..." : "PDF"}
      </button>
    </div>
  );
}
