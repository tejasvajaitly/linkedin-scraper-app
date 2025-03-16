// "use client";
// import useMeasure from "react-use-measure";
// import React, { useEffect, useState } from "react";
// import { TransitionPanel } from "@/components/ui/transition-panel";

// function Button({
//   onClick,
//   children,
// }: {
//   onClick: () => void;
//   children: React.ReactNode;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       type="button"
//       className="relative flex h-8 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-lg border border-zinc-950/10 bg-transparent px-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 active:scale-[0.98] dark:border-zinc-50/10 dark:text-zinc-50 dark:hover:bg-zinc-800"
//     >
//       {children}
//     </button>
//   );
// }
// export function TransitionPanelCard() {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const [ref, bounds] = useMeasure();

//   // Form state
//   const [linkedinUrl, setLinkedinUrl] = useState("");
//   const [templateName, setTemplateName] = useState("");
//   const [selectedFields, setSelectedFields] = useState<string[]>([]);
//   const [authCookie, setAuthCookie] = useState("");

//   const AVAILABLE_FIELDS = ["url", "name", "company", "location", "headline"];

//   const FEATURES = [
//     {
//       title: "LinkedIn URL",
//       component: (
//         <div className="space-y-4">
//           <input
//             type="text"
//             value={linkedinUrl}
//             onChange={(e) => setLinkedinUrl(e.target.value)}
//             placeholder="Enter LinkedIn Profile URL"
//             className="w-full p-2 border rounded dark:bg-zinc-600 dark:border-zinc-500"
//           />
//         </div>
//       ),
//     },
//     {
//       title: "Template Name",
//       component: (
//         <div className="space-y-4">
//           <input
//             type="text"
//             value={templateName}
//             onChange={(e) => setTemplateName(e.target.value)}
//             placeholder="Enter Template Name"
//             className="w-full p-2 border rounded dark:bg-zinc-600 dark:border-zinc-500"
//           />
//         </div>
//       ),
//     },
//     {
//       title: "Select Fields",
//       component: (
//         <div className="space-y-4">
//           {selectedFields.map((field, index) => (
//             <div key={index} className="flex gap-2">
//               <select
//                 value={field}
//                 onChange={(e) => {
//                   const newFields = [...selectedFields];
//                   newFields[index] = e.target.value;
//                   setSelectedFields(newFields);
//                 }}
//                 className="w-full p-2 border rounded dark:bg-zinc-600 dark:border-zinc-500"
//               >
//                 {AVAILABLE_FIELDS.filter(
//                   (f) => !selectedFields.includes(f) || f === field
//                 ).map((field) => (
//                   <option key={field} value={field}>
//                     {field.charAt(0).toUpperCase() + field.slice(1)}
//                   </option>
//                 ))}
//               </select>
//               <button
//                 onClick={() => {
//                   const newFields = selectedFields.filter(
//                     (_, i) => i !== index
//                   );
//                   setSelectedFields(newFields);
//                 }}
//                 className="px-3 py-1 text-red-500 border rounded"
//               >
//                 -
//               </button>
//             </div>
//           ))}
//           {selectedFields.length < AVAILABLE_FIELDS.length && (
//             <button
//               onClick={() =>
//                 setSelectedFields([
//                   ...selectedFields,
//                   AVAILABLE_FIELDS.find((f) => !selectedFields.includes(f)) ||
//                     "",
//                 ])
//               }
//               className="w-full p-2 text-green-500 border rounded"
//             >
//               + Add Field
//             </button>
//           )}
//         </div>
//       ),
//     },
//     {
//       title: "LinkedIn Authentication",
//       component: (
//         <div className="space-y-4">
//           <div className="mb-4">
//             <a
//               href="#" // Replace with actual video link
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-500 hover:underline"
//             >
//               Watch how to get your LinkedIn authentication cookie
//             </a>
//           </div>
//           <textarea
//             value={authCookie}
//             onChange={(e) => setAuthCookie(e.target.value)}
//             placeholder="Paste your LinkedIn authentication cookie here"
//             className="w-full p-2 border rounded dark:bg-zinc-600 dark:border-zinc-500"
//             rows={4}
//           />
//         </div>
//       ),
//     },
//   ];

//   const handleSetActiveIndex = (newIndex: number) => {
//     setDirection(newIndex > activeIndex ? 1 : -1);
//     setActiveIndex(newIndex);
//   };

//   useEffect(() => {
//     if (activeIndex < 0) setActiveIndex(0);
//     if (activeIndex >= FEATURES.length) setActiveIndex(FEATURES.length - 1);
//   }, [activeIndex]);

//   const variants = {
//     enter: (direction: number) => ({
//       x: direction > 0 ? 364 : -364,
//       opacity: 0,
//     }),
//     center: {
//       zIndex: 1,
//       x: 0,
//       opacity: 1,
//     },
//     exit: (direction: number) => ({
//       zIndex: 0,
//       x: direction < 0 ? 364 : -364,
//       opacity: 0,
//       position: "absolute",
//       top: 0,
//       left: 0,
//       width: "100%",
//     }),
//   };

//   const handleNext = () => {
//     if (activeIndex === FEATURES.length - 1) {
//       // Navigate to results page with collected data
//       console.log({
//         linkedinUrl,
//         templateName,
//         selectedFields,
//         authCookie,
//       });
//       // Add your navigation logic here
//       return;
//     }
//     handleSetActiveIndex(activeIndex + 1);
//   };

//   return (
//     <div className="w-[364px] overflow-hidden rounded-xl border border-zinc-950/10 bg-white dark:bg-zinc-700">
//       <TransitionPanel
//         activeIndex={activeIndex}
//         variants={{
//           enter: (direction) => ({
//             x: direction > 0 ? 364 : -364,
//             opacity: 0,
//             height: bounds.height > 0 ? bounds.height : "auto",
//             position: "initial",
//           }),
//           center: {
//             zIndex: 1,
//             x: 0,
//             opacity: 1,
//             height: bounds.height > 0 ? bounds.height : "auto",
//           },
//           exit: (direction) => ({
//             zIndex: 0,
//             x: direction < 0 ? 364 : -364,
//             opacity: 0,
//             position: "absolute",
//             top: 0,
//             width: "100%",
//           }),
//         }}
//         transition={{
//           x: { type: "spring", stiffness: 300, damping: 30 },
//           opacity: { duration: 0.2 },
//         }}
//         custom={direction}
//       >
//         {FEATURES.map((feature, index) => (
//           <div key={index} className="px-4 pt-4" ref={ref}>
//             <h3 className="mb-2 font-medium text-zinc-800 dark:text-zinc-100">
//               {feature.title}
//             </h3>
//             {feature.component}
//           </div>
//         ))}
//       </TransitionPanel>
//       <div className="flex justify-between p-4">
//         {activeIndex > 0 ? (
//           <Button onClick={() => handleSetActiveIndex(activeIndex - 1)}>
//             Previous
//           </Button>
//         ) : (
//           <div />
//         )}
//         <Button onClick={handleNext}>
//           {activeIndex === FEATURES.length - 1 ? "Extract" : "Next"}
//         </Button>
//       </div>
//     </div>
//   );
// }

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
      className="relative flex h-8 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-lg border border-zinc-950/10 bg-transparent px-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 active:scale-[0.98] dark:border-zinc-50/10 dark:text-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

export default function TransitionPanelCard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [ref, bounds] = useMeasure();

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
    <div className="w-[500px] overflow-hidden rounded-xl border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900">
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
            <h3 className="mb-4 text-xl font-medium text-zinc-800 dark:text-zinc-100">
              {step.title}
            </h3>
            {step.component}
          </div>
        ))}
      </TransitionPanel>
      <div className="flex justify-between p-4 border-t dark:border-zinc-700">
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
    </div>
  );
}
