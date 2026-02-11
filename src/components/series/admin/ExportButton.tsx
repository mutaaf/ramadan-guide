"use client";

import { useState } from "react";
import { useAdminStore } from "@/lib/series/admin-store";

export function ExportButton() {
  const exportToJSON = useAdminStore((s) => s.exportToJSON);
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    const data = exportToJSON();

    // Download series-index.json
    downloadJSON("series-index.json", data.index);

    // Download each series episodes file
    for (const [seriesId, seriesData] of Object.entries(data.seriesData)) {
      downloadJSON(`${seriesId}-episodes.json`, seriesData);
    }

    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <button
      onClick={handleExport}
      className="w-full text-sm font-medium px-4 py-3 rounded-xl transition-colors"
      style={{
        background: exported ? "rgba(45, 212, 191, 0.12)" : "var(--surface-1)",
        color: exported ? "var(--accent-teal, #2dd4bf)" : "var(--foreground)",
        border: "1px solid var(--card-border)",
      }}
    >
      {exported ? "Downloaded! Keep as backup." : "Download JSON (Backup)"}
    </button>
  );
}

function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
