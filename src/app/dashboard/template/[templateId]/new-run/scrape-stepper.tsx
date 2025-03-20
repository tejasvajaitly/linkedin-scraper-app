"use client";

import ProfileCard from "@/app/dashboard/new-template/profile-card";
import { useEffect, useState } from "react";
import {
  Check,
  Loader2,
  X,
  Circle,
  FileText,
  Tags,
  Play,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

interface LinkedInProfile {
  name: string;
  headline: string;
  location: string;
  currentCompany: string;
  profilePhotoUrl: string;
  profileUrl: string;
}

type StepStatus = "pending" | "in-progress" | "complete" | "error";

interface Step {
  id: number;
  label: string;
  message: string; // Dynamic message for the group
  status: StepStatus;
}

const initialSteps: Step[] = [
  { id: 1, label: "Browser Setup", message: "", status: "pending" },
  { id: 2, label: "Playwright Scraping", message: "", status: "pending" },
  { id: 3, label: "OpenAI Extracting", message: "", status: "pending" },
  { id: 4, label: "Finishing", message: "", status: "pending" },
];

interface ScrapeStepperProps {
  templateId: string;
  url: string;
  fields: string[];
  cookies: Array<{ name: string; value: string; domain: string; path: string }>;
  client: SupabaseClient<any, "public", any>;
}

interface CreateRunResponse {
  run: {
    id: string;
    template_id: string;
  };
}

export default function ScrapeStepper({
  templateId,
  url,
  fields,
  cookies,
  client,
}: ScrapeStepperProps) {
  const router = useRouter();
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isStarted, setIsStarted] = useState(false);

  const createRun = useMutation({
    mutationFn: async (): Promise<CreateRunResponse> => {
      // Create only a new run for existing template
      const { data: run, error: runError } = await client
        .from("runs")
        .insert({
          template_id: templateId,
        })
        .select("*")
        .single();

      if (runError || !run) {
        throw runError || new Error("Failed to create run");
      }

      return { run };
    },
    onSuccess: (data) => {
      const eventSource = setupEventSource(data.run.id);
      setIsStarted(true);

      return () => {
        eventSource.close();
      };
    },
    onError: (error) => {
      setError(
        error instanceof Error ? error.message : "Failed to start scraping"
      );
    },
  });

  const setupEventSource = (runId: string) => {
    const params = new URLSearchParams({
      url,
      fields: JSON.stringify(fields),
      cookies: JSON.stringify(cookies),
    });

    const eventSource = new EventSource(
      // `http://localhost:3000/scrape?${params.toString()}`
      `https://api.mole.tejasvajaitly.com/scrape?${params.toString()}`
    );

    eventSource.addEventListener("browser-setup", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      updateStep(
        1,
        data.message,
        data.message === "New page opened" ? "complete" : "in-progress"
      );
    });

    eventSource.addEventListener("playwright-scraping", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      // Update Playwright Scraping step.
      updateStep(
        2,
        data.message,
        data.message === "No next button found. Ending pagination." ||
          data.message === "Pagination limit reached."
          ? "complete"
          : "in-progress"
      );
    });

    eventSource.addEventListener("openai-extracting", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      // Update OpenAI Extracting step.
      updateStep(
        3,
        data.message,
        data.message === "All pages processed successfully."
          ? "complete"
          : "in-progress"
      );
    });

    eventSource.addEventListener("finishing", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      // Update Finishing step.
      updateStep(
        4,
        data.message,
        data.message === "wrapup!" ? "complete" : "in-progress"
      );
    });

    eventSource.addEventListener("error", async (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setError(data.message);
      setSteps((prev) =>
        prev.map((step) =>
          step.status === "in-progress" ? { ...step, status: "error" } : step
        )
      );
      await updateRunStatus(runId, "failed", null, data.message);
      eventSource.close();
    });

    eventSource.addEventListener("result", async (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      setResult(data);
      updateStep(4, "Finished", "complete");
      await updateRunStatus(runId, "success", data.results);
      eventSource.close();
    });

    return eventSource;
  };

  const updateRunStatus = async (
    runId: string,
    status: string,
    result?: any,
    error?: string
  ) => {
    console.log("Updating run status:", runId);
    try {
      await client
        .from("runs")
        .update({
          status,
          result,
          error_message: error,
        })
        .eq("id", runId);
    } catch (error) {
      console.error("Failed to update run status:", error);
    }
  };

  const startScraping = () => {
    createRun.mutate();
  };

  // Update step by ID with new message and status.
  const updateStep = (
    id: number,
    newMessage: string,
    newStatus: StepStatus
  ) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id
          ? { ...step, message: newMessage, status: newStatus }
          : step
      )
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {!isStarted && (
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">LinkedIn Data Extraction</h2>
            <p className="text-muted-foreground">
              Ready to extract data from:{" "}
              <span className="font-medium">{url}</span>
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Tags className="w-4 h-4" />
              <span>Fields: {fields.join(", ")}</span>
            </div>
          </div>

          <Button
            size="lg"
            className="px-8"
            onClick={startScraping}
            disabled={createRun.isPending}
          >
            {createRun.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting Extraction...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Extraction
              </>
            )}
          </Button>
        </div>
      )}

      {isStarted && !result && (
        <div className="space-y-8">
          <h2 className="text-xl font-semibold">Extraction Progress</h2>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[15px] top-[24px] bottom-4 w-[2px] bg-border" />

            {/* Steps */}
            <div className="space-y-8">
              {steps.map((step) => (
                <div key={step.id} className="flex gap-4 items-start">
                  {/* Step Indicator */}
                  <div className="relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-background">
                    {step.status === "pending" && (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                    {step.status === "in-progress" && (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    )}
                    {step.status === "complete" && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                    {step.status === "error" && (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pt-1 space-y-1">
                    <div className="font-medium">{step.label}</div>
                    {step.message && (
                      <p className="text-sm text-muted-foreground">
                        {step.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
            <XCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>

          {error === "LinkedIn session expired" && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">LinkedIn Session Expired</h3>
                  <p className="text-sm text-muted-foreground">
                    Your LinkedIn authentication has expired. Please follow the
                    guide below to get a new cookie and try again.
                  </p>
                </div>

                <div className="aspect-video h-[300px] border rounded-lg overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src="https://player.vimeo.com/video/1067238912?h=b90ad44755"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again with New Cookie
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-medium">Extraction completed successfully!</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">View Complete Results</p>
              <p className="text-sm text-muted-foreground">
                Access more actions and detailed information about this
                extraction
              </p>
            </div>
            <Button asChild>
              <Link
                href={`/dashboard/template/${templateId}/run/${createRun.data?.run.id}`}
                className="flex items-center"
              >
                Go to Run Details
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Preview Results</h3>
              <p className="text-sm text-muted-foreground">
                Showing {result?.results?.length} profiles
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
              {result?.results?.map((profile: any, index: number) => (
                <ProfileCard key={index} profile={profile} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
