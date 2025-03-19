"use client";

import { Button } from "@/components/ui/button";
import { FileJson, FileSpreadsheet } from "lucide-react";
import { json2csv } from "json-2-csv";

interface ExportButtonsProps {
  data: any[];
  templateName: string;
}

function downloadJson(data: any, filename: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

async function downloadCsv(data: any[], filename: string) {
  try {
    const csv = await json2csv(data, {
      emptyFieldValue: "",
      expandArrayObjects: true,
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error converting to CSV:", error);
  }
}

export function ExportButtons({ data, templateName }: ExportButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() =>
          downloadJson(
            data,
            `linkedin_data_${templateName}_${
              new Date().toISOString().split("T")[0]
            }.json`
          )
        }
      >
        <FileJson className="w-4 h-4 mr-2" />
        Export JSON
      </Button>
      <Button
        variant="outline"
        onClick={async () => {
          try {
            await downloadCsv(
              data,
              `linkedin_data_${templateName}_${
                new Date().toISOString().split("T")[0]
              }.csv`
            );
          } catch (error) {
            console.error("Error downloading CSV:", error);
          }
        }}
      >
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        Export CSV
      </Button>
    </div>
  );
}
