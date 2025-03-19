"use client";
import Link from "next/link";
import { useState } from "react";
import { TransitionPanel } from "@/components/ui/transition-panel";
import useMeasure from "react-use-measure";
import Glow from "@/app/glow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, ExternalLink, Info, CircleMinus } from "lucide-react";
import ScrapeStepper from "./scrape-stepper";
import { useSession, useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

// Add this validation function at the top level
const isValidLinkedInSearchUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === "www.linkedin.com" &&
      urlObj.pathname === "/search/results/people/" &&
      urlObj.searchParams.has("keywords")
    );
  } catch {
    return false;
  }
};

export default function TransitionPanelCard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [cookie, setCookie] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [ref, bounds] = useMeasure();

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

  const handleSetActiveIndex = (newIndex: number) => {
    setDirection(newIndex > activeIndex ? 1 : -1);
    setActiveIndex(newIndex);
  };

  // Called when extraction is complete (optional)
  const handleExtractionComplete = (result: any) => {
    console.log("Extraction complete:", result);
  };

  // This function is triggered when the user clicks the "Extract" button.
  const handleExtract = async () => {
    setIsExtracting(true);
  };

  const isNextDisabled = () => {
    switch (activeIndex) {
      case 0: // Name step
        return !name.trim();
      case 1: // LinkedIn URL step
        return !linkedinUrl.trim() || !isValidLinkedInSearchUrl(linkedinUrl);
      case 2: // Fields step
        return selectedFields.length === 0;
      case 3: // Cookie step
        return !cookie.trim();
      default:
        return false;
    }
  };

  if (isExtracting) {
    return (
      <ScrapeStepper
        url={linkedinUrl}
        fields={selectedFields}
        client={client}
        templateName={name}
        cookies={[
          {
            name: "li_at",
            value: cookie,
            domain: ".linkedin.com",
            path: "/",
          },
        ]}
      />
    );
  }

  return (
    <div className="h-full flex justify-center items-center">
      <Glow>
        <div className="relative overflow-hidden rounded-2xl bg-black backdrop-blur-sm">
          <TransitionPanel
            activeIndex={activeIndex}
            variants={{
              enter: (direction) => ({
                x: direction > 0 ? 364 : -364,
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
                x: direction < 0 ? 364 : -364,
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
            <Name name={name} setName={setName} />
            <Url linkedinUrl={linkedinUrl} setLinkedinUrl={setLinkedinUrl} />
            <Fields
              selectedFields={selectedFields}
              setSelectedFields={setSelectedFields}
            />
            <Cookie cookie={cookie} setCookie={setCookie} />
          </TransitionPanel>
          <div className="flex justify-between p-4">
            {activeIndex > 0 ? (
              <Button
                className="cursor-pointer my-2"
                variant="secondary"
                onClick={() => handleSetActiveIndex(activeIndex - 1)}
              >
                Previous
              </Button>
            ) : (
              <div />
            )}
            {activeIndex === 3 ? (
              <Button
                className="cursor-pointer my-2"
                onClick={handleExtract}
                disabled={!cookie.trim()}
              >
                Continue
              </Button>
            ) : (
              <Button
                className="cursor-pointer my-2"
                onClick={() => handleSetActiveIndex(activeIndex + 1)}
                disabled={isNextDisabled()}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </Glow>
    </div>
  );
}

function Name({
  name,
  setName,
}: {
  name: string;
  setName: (value: string) => void;
}) {
  return (
    <div className="space-y-4 p-4">
      <p className="text-zinc-600 dark:text-zinc-400">
        Give your extraction template a name for future reference.
      </p>
      <Input
        placeholder="Template name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full"
      />
    </div>
  );
}

function Url({
  linkedinUrl,
  setLinkedinUrl,
}: {
  linkedinUrl: string;
  setLinkedinUrl: (value: string) => void;
}) {
  const isValidUrl =
    !linkedinUrl.trim() || isValidLinkedInSearchUrl(linkedinUrl);

  return (
    <div className="space-y-4 p-4">
      <p className="text-zinc-600 dark:text-zinc-400">
        Enter the LinkedIn search URL you want to extract data from.
      </p>
      <div className="space-y-2">
        <Input
          placeholder="https://www.linkedin.com/search/results/people/?keywords=..."
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          className={`w-full ${!isValidUrl ? "border-red-500" : ""}`}
        />
        {!isValidUrl && (
          <p className="text-sm text-red-500">
            Please enter a valid LinkedIn search URL (e.g.,
            https://www.linkedin.com/search/results/people/?keywords=...)
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Only LinkedIn people search URLs are supported (e.g.,
          /search/results/people/)
        </p>
      </div>
    </div>
  );
}

function Fields({
  selectedFields,
  setSelectedFields,
}: {
  selectedFields: string[];
  setSelectedFields: (value: string[]) => void;
}) {
  const [currentField, setCurrentField] = useState("");
  const availableFields = ["url", "name", "company", "location", "headline"];
  const remainingFields = availableFields.filter(
    (field) => !selectedFields.includes(field)
  );
  return (
    <div className="space-y-4 p-4">
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
                setSelectedFields(selectedFields.filter((f) => f !== field));
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
                if (currentField && !selectedFields.includes(currentField)) {
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
  );
}

function Cookie({
  cookie,
  setCookie,
}: {
  cookie: string;
  setCookie: (value: string) => void;
}) {
  return (
    <div className="space-y-4 p-4">
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
  );
}
