"use client";

import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Cookie, HelpCircle } from "lucide-react";
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

          <div className="flex items-start gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  How to get cookies?
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>How to get LinkedIn cookies</DialogTitle>
                  <DialogDescription>
                    Follow these steps to get your LinkedIn authentication
                    cookies
                  </DialogDescription>
                </DialogHeader>
                <div className="aspect-video">
                  <video
                    controls
                    className="w-full rounded-lg"
                    src="/cookie-guide.mp4" // Add your video path here
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">LinkedIn Cookie</label>
              <Textarea
                placeholder="Paste your LinkedIn cookie here..."
                value={cookie}
                onChange={(e) => setCookie(e.target.value)}
                className="min-h-[100px] font-mono text-sm"
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
