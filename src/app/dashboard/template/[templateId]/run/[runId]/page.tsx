import { createClerkSupabaseClientSsr } from "@/app/dashboard/client";
import ProfileCard from "@/app/dashboard/new-template/profile-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  FileJson,
  FileSpreadsheet,
  Clock,
  Users,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportButtons } from "./export-buttons";
import { RerunButton } from "./rerun-button";

interface PageProps {
  params: Promise<{
    runId: string;
    templateId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const { runId } = resolvedParams;
  const client = await createClerkSupabaseClientSsr();
  const { data: run } = await client
    .from("runs")
    .select()
    .eq("id", runId)
    .single();
  const { data: template } = await client
    .from("templates")
    .select()
    .eq("id", run.template_id)
    .single();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
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
              <BreadcrumbLink href={`/dashboard/template/${run.template_id}`}>
                Template
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Run</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2">
          <RerunButton templateId={template.id} />
          <ExportButtons data={run.result} templateName={template.name} />
        </div>
      </div>

      {/* Run Info Header */}
      <div className="flex flex-col gap-4 bg-card p-6 rounded-lg border">
        <div className="flex items-center gap-3">
          {getStatusIcon(run?.status)}
          <h1 className="text-2xl font-semibold tracking-tight">
            {template?.name}
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="flex items-center gap-2">
              <span className="font-medium capitalize">{run?.status}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Created</p>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">
                {new Date(run?.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Results</p>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">
                {run?.result?.length || 0} profiles
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">LinkedIn URL</p>
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{template?.linkedin_url}</span>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-4 p-4 mx-auto">
        {run.result.map((result: any) => (
          <ProfileCard key={result.name} profile={result} />
        ))}
      </div>
    </div>
  );
}
