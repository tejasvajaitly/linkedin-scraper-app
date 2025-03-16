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
import { PlusCircle, ExternalLink, Info } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

function Button({
  onClick,
  children,
  disabled = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      disabled={disabled}
      className="relative flex h-8 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-lg bg-zinc-800/50 px-4 text-sm text-zinc-300 transition-all hover:bg-zinc-700/50 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-violet-500/50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
    >
      {children}
    </button>
  );
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

  const availableFields = ["url", "name", "company", "location", "headline"];

  const remainingFields = availableFields.filter(
    (field) => !selectedFields.includes(field)
  );

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
              <div
                key={field}
                className="flex items-center justify-between rounded-md border p-2 dark:border-zinc-700"
              >
                <span className="capitalize">{field}</span>
                <Button
                  onClick={() => {
                    setSelectedFields(
                      selectedFields.filter((f) => f !== field)
                    );
                  }}
                >
                  Remove
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
                <button
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
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                >
                  <PlusCircle className="h-4 w-4" />
                </button>
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
            Your LinkedIn data extraction is complete. Here are the results.
          </p>

          <div className="rounded-md border p-4 dark:border-zinc-700">
            <p className="text-center text-zinc-500 dark:text-zinc-400">
              Extracted data will appear here
            </p>
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
      case 0:
        return !linkedinUrl;
      case 1:
        return !templateName;
      case 2:
        return selectedFields.length === 0;
      case 3:
        return !authCookie;
      default:
        return false;
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
              <Button onClick={() => handleSetActiveIndex(activeIndex - 1)}>
                Previous
              </Button>
            ) : (
              <div />
            )}
            <Button
              onClick={() =>
                activeIndex === STEPS.length - 1
                  ? null
                  : handleSetActiveIndex(activeIndex + 1)
              }
              disabled={isNextDisabled()}
            >
              {activeIndex === STEPS.length - 1
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
