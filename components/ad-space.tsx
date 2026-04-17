import { cn } from "@/lib/utils"

interface AdSpaceProps {
  className?: string;
  position: "top" | "bottom";
}

export function AdSpace({ className, position }: AdSpaceProps) {
  return (
    <div className={cn("w-full flex flex-col items-center gap-2 py-6", className)}>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium">
        Advertisement
      </span>
      {/* Placeholder for actual Ad Provider (AdSense, etc.)
          Standard Leaderboard: 728x90 
      */}
      <div className="w-full max-w-[728px] h-[90px] bg-glass border border-dashed border-glass-border flex items-center justify-center rounded-lg">
        <span className="text-xs text-muted-foreground/30 italic">
          {position === "top" ? "Top Leaderboard" : "Bottom Leaderboard"}
        </span>
      </div>
    </div>
  )
}