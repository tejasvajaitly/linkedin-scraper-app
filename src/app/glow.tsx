"use client";
import { useState } from "react";

export default function Glow({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isHovered, setIsHovered] = useState(false);
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
        {children}
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
