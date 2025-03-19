"use client";

import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Cookie, HelpCircle, Info, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ScrapeStepper from "./scrape-stepper";
import { useSession } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function NewRunPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const [cookie, setCookie] = useState("");
  const [isReady, setIsReady] = useState(false);
  const resolvedParams = use(params); // Resolve the async params

  const { user } = useUser();
  const { session } = useSession();
  const router = useRouter();

  function createClerkSupabaseClient() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
      {
        global: {
          // Get the custom Supabase token from Clerk
          fetch: async (url, options = {}) => {
            const clerkToken = await session?.getToken({
              template: "supabase",
            });

            // Insert the Clerk Supabase token into the headers
            const headers = new Headers(options?.headers);
            headers.set("Authorization", `Bearer ${clerkToken}`);

            // Now call the default fetch
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

  // Fetch template using React Query
  const {
    data: template,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["template", resolvedParams.templateId],
    queryFn: async () => {
      const { data, error } = await client
        .from("templates")
        .select()
        .eq("id", resolvedParams.templateId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // When starting a new run
  const startRunMutation = useMutation({
    mutationFn: async () => {
      // ... run creation logic
      toast.success("Started new extraction run");
    },
    onError: (error) => {
      toast.error("Failed to start new run");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">
          Failed to load template. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {!isReady ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">New Extraction Run</h1>
            <p className="text-muted-foreground">
              To run a new extraction, we need fresh LinkedIn authentication
              cookies.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Watch our tutorial to learn how to get your LinkedIn cookie.
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 md:mt-0 text-sm font-medium text-blue-700 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
                      >
                        <span>Watch tutorial</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[800px] w-full">
                      <DialogHeader>
                        <DialogTitle>How to get LinkedIn cookies</DialogTitle>
                        <DialogDescription>
                          Follow these steps to get your LinkedIn authentication
                          cookies
                        </DialogDescription>
                      </DialogHeader>
                      <div
                        className="relative w-full"
                        style={{ paddingBottom: "56.25%" }}
                      >
                        <iframe
                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                          src="https://player.vimeo.com/video/1067238912?h=b90ad44755"
                          allow="autoplay; fullscreen"
                          allowFullScreen
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            <Input
              placeholder="Paste your LinkedIn auth cookie here"
              value={cookie}
              onChange={(e) => setCookie(e.target.value)}
              className="w-full font-mono text-xs"
            />
          </div>

          <Button
            className="w-full"
            disabled={!cookie.trim()}
            onClick={() => setIsReady(true)}
          >
            <Cookie className="w-4 h-4 mr-2" />
            Use Cookie & Start Extraction
          </Button>
        </div>
      ) : (
        template && (
          <ScrapeStepper
            url={template.linkedin_url}
            fields={template.selected_fields}
            cookies={[
              {
                name: "li_at",
                value: cookie,
                domain: ".linkedin.com",
                path: "/",
              },
            ]}
            client={client}
            templateId={resolvedParams.templateId}
          />
        )
      )}
    </div>
  );
}
