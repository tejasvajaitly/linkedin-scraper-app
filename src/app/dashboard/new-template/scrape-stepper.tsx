"use client";

import ProfileCard from "./profile-card";
import { useEffect, useState } from "react";
import { Check, Loader2, X, Circle } from "lucide-react";

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
  url: string;
  fields: string[];
  cookies: Array<{ name: string; value: string; domain: string; path: string }>;
  onComplete?: (result: any) => void;
}

export default function ScrapeStepper({
  url,
  fields,
  cookies,
  onComplete,
}: ScrapeStepperProps) {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

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

  // Set up event listeners for distinct event types.
  useEffect(() => {
    const params = new URLSearchParams({
      url,
      fields: JSON.stringify(fields),
      cookies: JSON.stringify(cookies),
    });
    const eventSource = new EventSource(
      `http://localhost:3000/scrape?${params.toString()}`
    );

    eventSource.addEventListener("browser-setup", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      // Update Browser Setup step.
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

    eventSource.addEventListener("error", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      console.error("SSE error:", data.message);
      setError(data.message);
      setSteps((prev) =>
        prev.map((step) =>
          step.status === "in-progress" ? { ...step, status: "error" } : step
        )
      );
      eventSource.close();
    });

    eventSource.addEventListener("result", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      console.log("SSE result:", data);
      setResult(data);
      updateStep(4, "Finished", "complete");
      eventSource.close();
      if (onComplete) onComplete(data);
    });

    return () => {
      eventSource.close();
    };
  }, [url, fields, cookies, onComplete]);

  return (
    <div className="py-32">
      {!result && (
        <>
          <h1 className="text-2xl font-bold mb-6">Extraction Progress</h1>
          <ol className="space-y-4">
            {steps.map((step) => (
              <li key={step.id} className="flex flex-col p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{step.label}</span>
                  <span>
                    {step.status === "pending" && (
                      <Circle className="text-gray-400" size={20} />
                    )}
                    {step.status === "in-progress" && (
                      <Loader2
                        className="animate-spin text-blue-500"
                        size={20}
                      />
                    )}
                    {step.status === "complete" && (
                      <Check className="text-green-500" size={20} />
                    )}
                    {step.status === "error" && (
                      <X className="text-red-500" size={20} />
                    )}
                  </span>
                </div>
                {step.message && (
                  <p className="text-xs text-gray-600 mt-1">{step.message}</p>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
      {error && (
        <div className="mt-6 p-4 border border-red-300 rounded bg-red-50 text-red-700">
          Error: {error}
        </div>
      )}
      {result && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {result.results.map((profile: any, index: any) => (
            <ProfileCard key={index} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}
