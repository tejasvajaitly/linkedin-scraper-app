"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Link as LinkIcon,
  Tags,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Page() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { session } = useSession();

  function createClerkSupabaseClient() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            const clerkToken = await session?.getToken({
              template: "supabase",
            });
            const headers = new Headers(options?.headers);
            headers.set("Authorization", `Bearer ${clerkToken}`);
            return fetch(url, {
              ...options,
              headers,
            });
          },
        },
      }
    );
  }

  const client = createClerkSupabaseClient();

  const {
    data: templates,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["templates", user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await client.from("templates").select(`
          *,
          runs (
            status,
            created_at
          )
        `);

        if (error) {
          toast.error("Failed to load templates");
          throw error;
        }

        toast.success("Templates loaded successfully");
        return data;
      } catch (error) {
        toast.error("Error loading templates");
        throw error;
      }
    },
    enabled: !!user && !!session,
  });

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

  if (!isUserLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">
            Please sign in to view your templates
          </p>
        </div>
        <Button asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">
          Failed to load templates. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header with greeting and New Template Button */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Hello, {user?.firstName || "there"}
          </h1>
          <p className="text-muted-foreground">
            Here are your LinkedIn scraping templates
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-medium tracking-tight">Templates</h2>
            <p className="text-sm text-muted-foreground">
              {templates?.length || 0} total templates
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/new-template">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Link>
          </Button>
        </div>
      </div>

      {/* Templates List */}
      <div className="space-y-2 flex flex-col gap-2">
        {templates?.map((template) => (
          <Link key={template.id} href={`/dashboard/template/${template.id}`}>
            <Card className="hover:bg-accent/50 py-0">
              <CardContent className="py-4 flex items-center gap-6">
                {/* Template Name */}
                <div className="flex items-center gap-2 min-w-[200px]">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{template.name}</span>
                </div>

                {/* LinkedIn URL - Scrollable */}
                <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-[300px] overflow-x-auto whitespace-nowrap scrollbar-thin">
                  <LinkIcon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    {template.linkedin_url}
                  </div>
                </div>

                {/* Selected Fields */}
                <div className="flex items-center gap-2 min-w-[200px]">
                  <Tags className="w-4 h-4 text-muted-foreground" />
                  <div className="flex gap-2">
                    {template.selected_fields?.map((field: string) => (
                      <Badge key={field} variant="secondary">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Latest Run Status */}
                {template.runs?.[0] && (
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(template.runs[0].status)}
                      <span className="text-sm capitalize">
                        {template.runs[0].status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {new Date(
                        template.runs[0].created_at
                      ).toLocaleDateString()}
                    </div>
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
