"use client";
import { useEffect, useState } from "react";
import {
  SignedIn,
  SignInButton,
  SignUpButton,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import Image from "next/image";
export default function Navbar({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div className="h-full">
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
                <span className="sr-only">Mole Logo</span>
                <Image src="/mole.svg" alt="Mole Logo" width={32} height={32} />
              </a>
              <div className="flex items-center gap-x-6 pr-6 sm:gap-x-12">
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm font-medium text-white hover:text-neutral-300 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <SignInButton />
                  <SignUpButton />
                </SignedOut>
              </div>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
