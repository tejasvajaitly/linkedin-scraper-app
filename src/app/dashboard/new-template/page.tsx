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

export default function TransitionPanelCard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState("jhhj");
  const [linkedinUrl, setLinkedinUrl] = useState(
    "https://www.linkedin.com/search/results/people/?keywords=founding%20engineer&origin=SWITCH_SEARCH_VERTICAL&sid=f0)"
  );
  const [selectedFields, setSelectedFields] = useState<string[]>(["Url"]);
  const [cookie, setCookie] = useState(
    "AQEDASBPaYkCKBZFAAABlaO-s88AAAGVx8s3z00AH-yfsyS1GjkBgUdBIHGfk2PMXSDpdCM58xI8psJSS2vlJ-U6_RzoNHuslpVlsLAG9J4g2b-wa4pQab2iHSiDgn2x0bNUHwokqGp1InM8MuD9K1jj"
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [ref, bounds] = useMeasure();

  const { user } = useUser();
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

  const handleSetActiveIndex = (newIndex: number) => {
    setDirection(newIndex > activeIndex ? 1 : -1);
    setActiveIndex(newIndex);
  };

  // Called when extraction is complete (optional)
  const handleExtractionComplete = (result: any) => {
    console.log("Extraction complete:", result);
  };

  // This function is triggered when the user clicks the "Extract" button.
  const handleExtract = () => {
    // Here you could validate the input fields.
    setIsExtracting(true);
  };

  if (isExtracting) {
    return (
      <ScrapeStepper
        url={linkedinUrl}
        fields={selectedFields}
        cookies={[
          {
            name: "li_at",
            value: cookie,
            domain: ".linkedin.com",
            path: "/",
          },
        ]}
        onComplete={handleExtractionComplete}
      />
    );
  }

  return (
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
            <Button className="cursor-pointer my-2" onClick={handleExtract}>
              Extract
            </Button>
          ) : (
            <Button
              className="cursor-pointer my-2"
              onClick={() => handleSetActiveIndex(activeIndex + 1)}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </Glow>
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
  return (
    <div className="space-y-4 p-4">
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
        value={cookie}
        onChange={(e) => setCookie(e.target.value)}
        className="w-full font-mono text-xs"
      />
    </div>
  );
}
