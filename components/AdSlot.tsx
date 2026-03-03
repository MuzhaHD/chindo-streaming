
"use client";

export default function AdSlot({ className }: { className?: string }) {
  return (
    <div
      className={`w-full h-24 md:h-32 bg-card rounded-xl flex items-center justify-center border border-gray-800 ${className}`}
    >
      <span className="text-foreground-muted text-sm">Slot Iklan</span>
    </div>
  );
}