"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-32 h-full">
      <div className="flex flex-col items-center justify-center px-4 text-center">
        <div className="space-y-6 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            LinkedIn Data Extraction
            <span className="text-blue-600"> Made Simple</span>
          </h1>

          <p className="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-400 text-xl sm:text-2xl">
            Effortlessly extract and analyze LinkedIn profiles with our powerful
            scraping tool. Transform LinkedIn data into actionable insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/dashboard" className="flex items-center">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
