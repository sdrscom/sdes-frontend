"use client";
import { ChevronDown } from "lucide-react";

export default function ScrollDownIndicator() {
  return (
    <div className="fixed bottom-5 -right-10 transform -translate-x-1/2 z-50 flex flex-col items-center gap-2">
      <span className="text-[#F27141] text-sm font-medium select-none">
        Scroll To Explore
      </span>
      <div>
        <ChevronDown className="w-8 h-8 text-[#F27141] animate-bounce" />
      </div>
    </div>
  );
}
