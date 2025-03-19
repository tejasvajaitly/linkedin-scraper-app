"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface RerunButtonProps {
  templateId: string;
}

export function RerunButton({ templateId }: RerunButtonProps) {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push(`/dashboard/template/${templateId}/new-run`)}
      variant="default"
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Rerun Template
    </Button>
  );
}
