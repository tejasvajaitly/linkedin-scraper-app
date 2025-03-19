import Link from "next/link";
import { createClerkSupabaseClientSsr } from "@/app/dashboard/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  LinkIcon,
  Tags,
  RefreshCw,
} from "lucide-react";
import { RerunButton } from "./run/[runId]/rerun-button";

export default async function Page({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const client = await createClerkSupabaseClientSsr();
  const { data: template } = await client
    .from("templates")
    .select()
    .eq("id", templateId)
    .single();

  const { data: runs } = await client
    .from("runs")
    .select()
    .eq("template_id", templateId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "pending":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Template</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <RerunButton templateId={templateId} />
      </div>

      {/* Template Info */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Template: {template?.name}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div>{runs?.length || 0} total runs</div>
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            {template?.linkedin_url}
          </div>
          <div className="flex items-center gap-2">
            <Tags className="w-4 h-4" />
            {template?.selected_fields?.map((field: string) => (
              <Badge key={field} variant="secondary">
                {field}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Runs List */}
      <div className="space-y-2 flex flex-col gap-2">
        {runs?.map((run) => (
          <Link
            key={run.id}
            href={`/dashboard/template/${templateId}/run/${run.id}`}
          >
            <Card className="hover:bg-accent/50 py-0">
              <CardContent className="py-4 flex items-center gap-6">
                <div className="flex items-center gap-2 min-w-[150px]">
                  {getStatusIcon(run.status)}
                  <span className="font-medium capitalize">{run.status}</span>
                </div>

                <div className="flex items-center gap-2 min-w-[150px]">
                  <span className="text-sm">
                    {run.result?.length || 0} profiles
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {new Date(run.created_at).toLocaleString()}
                </div>

                {run.error_message && (
                  <div className="text-sm text-red-500 truncate max-w-[300px]">
                    {run.error_message}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
