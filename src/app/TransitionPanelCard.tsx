"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { TransitionPanel } from "@/components/ui/transition-panel";
import useMeasure from "react-use-measure";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, ExternalLink, Info, CircleMinus } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useSession, useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Add this interface for typing
interface ScrapingResult {
  results: {
    profile: string;
    currentCompany: string;
  }[];
}

export default function TransitionPanelCard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [ref, bounds] = useMeasure();
  const [isHovered, setIsHovered] = useState(false);

  // Form state
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [authCookie, setAuthCookie] = useState("");
  const [currentField, setCurrentField] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const availableFields = ["url", "name", "company", "location", "headline"];

  // The `useUser()` hook will be used to ensure that Clerk has loaded data about the logged in user
  const { user } = useUser();
  // The `useSession()` hook will be used to get the Clerk session object
  const { session } = useSession();

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

  async function createTemplateAndRun() {
    try {
      // First create the template and get its ID
      const { data: template, error: templateError } = await client
        .from("templates")
        .insert({
          name: templateName,
          linkedin_url: linkedinUrl,
          selected_fields: selectedFields,
        })
        .select("id")
        .single();

      if (templateError || !template) {
        throw templateError || new Error("Failed to create template");
      }

      // Then create a run with the template_id
      const { error: runError } = await client.from("runs").insert({
        template_id: template.id,
        // status will default to 'pending' in the database
      });

      if (runError) {
        throw runError;
      }

      toast.success("Template created successfully");
      return template.id; // Return template ID for future reference
    } catch (error) {
      toast.error("Failed to create template");
      console.error("Error creating template and run:", error);
      throw error;
    }
  }

  const remainingFields = availableFields.filter(
    (field) => !selectedFields.includes(field)
  );

  const scrapeMutation = useMutation<ScrapingResult>({
    mutationFn: async () => {
      try {
        const res = await fetch("https://api.mole.tejasvajaitly.com/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: linkedinUrl,
            fields: selectedFields,
            cookies: [
              {
                name: "li_at",
                value: authCookie,
                domain: ".linkedin.com",
                path: "/",
              },
            ],
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        toast.success("Data extraction completed successfully");
        return data as ScrapingResult;
      } catch (error) {
        toast.error("Failed to extract data from LinkedIn");
        // Update run status to failed
        if (templateId) {
          await client
            .from("runs")
            .update({
              status: "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("template_id", templateId);
        }
        console.error("Scraping failed:", error);
        toast.error(`Scraping failed: ${error}`);
        throw error;
      }
    },
    onError: (error) => {
      console.error("Scraping failed:", error);
      toast.error(`Scraping failed: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("Scraping completed successfully");
    },
  });

  // Define the steps for the LinkedIn scraper
  const STEPS = [
    {
      title: "LinkedIn URL",
      component: (
        <div className="space-y-4">
          <p className="text-zinc-600 dark:text-zinc-400">
            Enter the LinkedIn profile URL you want to extract data from.
          </p>
          <Input
            placeholder="https://www.linkedin.com/in/username"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="w-full"
          />
        </div>
      ),
    },
    {
      title: "Template Name",
      component: (
        <div className="space-y-4">
          <p className="text-zinc-600 dark:text-zinc-400">
            Give your extraction template a name for future reference.
          </p>
          <Input
            placeholder="Template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full"
          />
        </div>
      ),
    },
    {
      title: "Select Fields",
      component: (
        <div className="space-y-4">
          <p className="text-zinc-600 dark:text-zinc-400">
            Choose the LinkedIn profile fields you want to extract.
          </p>

          <div className="space-y-4">
            {selectedFields.map((field) => (
              <div className="flex items-center gap-2" key={field}>
                <div className="flex items-center justify-between rounded-md border p-2 dark:border-zinc-700 w-full">
                  <span className="capitalize">{field}</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedFields(
                      selectedFields.filter((f) => f !== field)
                    );
                  }}
                >
                  <CircleMinus className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {remainingFields.length > 0 && (
              <div className="flex items-center gap-2">
                <Select onValueChange={setCurrentField} value={currentField}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a field" />
                  </SelectTrigger>
                  <SelectContent>
                    {remainingFields.map((field) => (
                      <SelectItem key={field} value={field}>
                        <span className="capitalize">{field}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (
                      currentField &&
                      !selectedFields.includes(currentField)
                    ) {
                      setSelectedFields([...selectedFields, currentField]);
                      setCurrentField("");
                    }
                  }}
                  disabled={!currentField}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "LinkedIn Authentication",
      component: (
        <div className="space-y-4">
          <p className="text-zinc-600 dark:text-zinc-400">
            Paste your LinkedIn authentication cookie to enable data extraction.
          </p>

          <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Watch our tutorial to learn how to get your LinkedIn cookie.
                </p>
                <p className="mt-3 text-sm md:ml-6 md:mt-0">
                  <Link
                    href="#"
                    className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200 flex items-center gap-1"
                  >
                    <span>Watch tutorial</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <Input
            placeholder="Paste your LinkedIn auth cookie here"
            value={authCookie}
            onChange={(e) => setAuthCookie(e.target.value)}
            className="w-full font-mono text-xs"
          />
        </div>
      ),
    },
    {
      title: "Extraction Results",
      component: (
        <div className="space-y-4">
          <p className="text-zinc-600 dark:text-zinc-400">
            {scrapeMutation.isPending
              ? "Extracting data from LinkedIn..."
              : scrapeMutation.isSuccess
              ? "Your LinkedIn data extraction is complete. Here are the results."
              : "Ready to extract data from LinkedIn."}
          </p>

          <div className="rounded-md border p-4 dark:border-zinc-700">
            {scrapeMutation.isPending && (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-violet-500"></div>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-violet-500 delay-150"></div>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-violet-500 delay-300"></div>
                </div>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Extracting profiles...
                </span>
              </div>
            )}

            {scrapeMutation.isError && (
              <div className="text-center text-red-500">
                <p>
                  Error:{" "}
                  {scrapeMutation.error?.message ||
                    "An error occurred during extraction"}
                </p>
              </div>
            )}

            {scrapeMutation.isSuccess && scrapeMutation.data && (
              <div className="space-y-4">
                <div className="grid gap-3">
                  {scrapeMutation.data.results.map((result, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-zinc-900 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <a
                          href={result.profile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-400 hover:text-violet-300 flex items-center gap-1"
                        >
                          View Profile
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="text-sm text-zinc-400">
                          {result.currentCompany}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-sm text-zinc-500">
                  Found {scrapeMutation?.data?.results?.length} profiles
                </div>
              </div>
            )}

            {!scrapeMutation.isPending &&
              !scrapeMutation.isSuccess &&
              !scrapeMutation.isError && (
                <p className="text-center text-zinc-500 dark:text-zinc-400">
                  Click "Extract" to begin the data extraction process
                </p>
              )}
          </div>
        </div>
      ),
    },
  ];

  const handleSetActiveIndex = (newIndex: number) => {
    setDirection(newIndex > activeIndex ? 1 : -1);
    setActiveIndex(newIndex);
  };

  useEffect(() => {
    if (activeIndex < 0) setActiveIndex(0);
    if (activeIndex >= STEPS.length) setActiveIndex(STEPS.length - 1);
  }, [activeIndex, STEPS.length]);

  const isNextDisabled = () => {
    switch (activeIndex) {
      case 0: // LinkedIn URL step
        return !linkedinUrl.trim() || !linkedinUrl.includes("linkedin.com");

      case 1: // Template Name step
        return !templateName.trim();

      case 2: // Select Fields step
        return selectedFields.length === 0;

      case 3: // LinkedIn Authentication step
        return !authCookie.trim();

      case 4: // Results step
        return false; // Last step, no next button

      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (isNextDisabled()) {
      return;
    }

    // If we're on the authentication step (step 3)
    if (activeIndex === 3) {
      setIsCreatingTemplate(true);
      setTemplateError(null);

      try {
        const newTemplateId = await createTemplateAndRun();
        setTemplateId(newTemplateId);
        scrapeMutation.mutate();
        // Move to next step after initiating the scraping
        handleSetActiveIndex(activeIndex + 1);
      } catch (error) {
        setTemplateError("Failed to initialize extraction");
        // Don't navigate if there's an error
        return;
      } finally {
        setIsCreatingTemplate(false);
      }
      return;
    }

    // For all other steps, just navigate if not on the last step
    if (activeIndex < STEPS.length - 1) {
      handleSetActiveIndex(activeIndex + 1);
    }
  };

  return (
    <div>
      <div
        className="relative w-full max-w-[500px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Expansive outer glow */}
        <div
          className="absolute -inset-12 transition-all duration-1000 ease-in-out"
          style={{
            background:
              "radial-gradient(circle at center, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05) 30%, rgba(139, 92, 246, 0.02) 60%, transparent 80%)",
            opacity: isHovered ? 0.8 : 0,
            filter: "blur(10px)",
          }}
        />

        {/* Middle layer glow */}
        <div
          className="absolute -inset-6 transition-all duration-900 ease-in-out"
          style={{
            background:
              "radial-gradient(circle at center, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1) 40%, rgba(139, 92, 246, 0.03) 70%, transparent)",
            opacity: isHovered ? 0.9 : 0.2,
            filter: "blur(8px)",
            transform: isHovered ? "scale(1.1)" : "scale(1)",
          }}
        />

        {/* Inner glow */}
        <div
          className="absolute -inset-3 rounded-3xl transition-all duration-800 ease-in-out"
          style={{
            background:
              "radial-gradient(circle at center, rgba(139, 92, 246, 0.25), rgba(139, 92, 246, 0.15) 30%, rgba(139, 92, 246, 0.05) 60%, transparent 80%)",
            opacity: isHovered ? 1 : 0.3,
            filter: "blur(5px)",
          }}
        />

        {/* Card */}
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-black backdrop-blur-sm"
          animate={{
            rotateY: isHovered ? 2 : 0,
            rotateX: isHovered ? -2 : 0,
            scale: isHovered ? 1.02 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.8,
          }}
        >
          <TransitionPanel
            activeIndex={activeIndex}
            variants={{
              enter: (direction) => ({
                x: direction > 0 ? 500 : -500,
                opacity: 0,
                height: bounds.height > 0 ? bounds.height : "auto",
                position: "initial",
              }),
              center: {
                zIndex: 1,
                x: 0,
                opacity: 1,
                height: bounds.height > 0 ? bounds.height : "auto",
              },
              exit: (direction) => ({
                zIndex: 0,
                x: direction < 0 ? 500 : -500,
                opacity: 0,
                position: "absolute",
                top: 0,
                width: "100%",
              }),
            }}
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            custom={direction}
          >
            {STEPS.map((step, index) => (
              <div
                key={index}
                className="px-6 pt-6 pb-4"
                ref={index === activeIndex ? ref : undefined}
              >
                <h3 className="mb-4 text-xl font-medium text-zinc-100">
                  {step.title}
                </h3>
                {step.component}
              </div>
            ))}
          </TransitionPanel>

          <div className="flex justify-between p-4 bg-black/20 backdrop-blur-sm">
            {activeIndex > 0 ? (
              <Button
                variant="secondary"
                onClick={() => handleSetActiveIndex(activeIndex - 1)}
              >
                Previous
              </Button>
            ) : (
              <div />
            )}
            <Button
              onClick={handleNext}
              disabled={
                isNextDisabled() ||
                isCreatingTemplate ||
                (activeIndex === 4 && scrapeMutation.isPending)
              }
            >
              {isCreatingTemplate
                ? "Creating Template..."
                : activeIndex === STEPS.length - 1
                ? "Close"
                : activeIndex === 3
                ? "Extract"
                : "Next"}
            </Button>
          </div>
        </motion.div>

        {/* Bottom shadow */}
        <div
          className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-[90%] h-16 transition-all duration-1000 ease-in-out"
          style={{
            background:
              "radial-gradient(ellipse, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05) 50%, transparent 80%)",
            opacity: isHovered ? 0.9 : 0.3,
            width: isHovered ? "110%" : "90%",
            filter: "blur(12px)",
          }}
        />
      </div>
    </div>
  );
}
