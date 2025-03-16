"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";

export default function Navbar({ isScrolled }) {
  return (
    <div className="fixed top-8 z-50 w-full">
      <div className="mx-auto w-full max-w-screen-lg px-4">
        <div
          className={`flex w-full items-center justify-between rounded-xl border transition-all duration-200 ease-out px-2 ${
            isScrolled
              ? "border-neutral-900 bg-neutral-950/80 backdrop-blur-sm"
              : "border-transparent bg-transparent backdrop-blur-0"
          }`}
        >
          <div className="flex w-full items-center justify-between p-2">
            <a href="#" className="p-1">
              <span className="sr-only">Motion Agent</span>
              <svg
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 70 70"
                aria-label="MP Logo"
                width="70"
                height="70"
                className="h-8 w-auto text-white"
                fill="none"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="3"
                  d="M51.883 26.495c-7.277-4.124-18.08-7.004-26.519-7.425-2.357-.118-4.407-.244-6.364 1.06M59.642 51c-10.47-7.25-26.594-13.426-39.514-15.664-3.61-.625-6.744-1.202-9.991.263"
                ></path>
              </svg>
            </a>
            <div className="flex gap-x-6 pr-6 sm:gap-x-12">
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
