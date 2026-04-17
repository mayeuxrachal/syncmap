import { Github, Globe, Heart } from "lucide-react"

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full mt-24 px-6 py-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-white/40 text-[11px] font-medium uppercase tracking-wider">
    
        {/* Left: Brand + New Icon */}
        <div className="flex items-center gap-3">
          {/* Pulse Beam Icon */}
          <svg 
            viewBox="0 0 24 24" 
            width="22" 
            height="22" 
            className="drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
          >
            {/* Top offset bar (Slate-700) */}
            <rect x="2" y="8" width="13" height="2.5" rx="1" fill="#334155"/>
            {/* Bottom offset bar (Slate-700) */}
            <rect x="9" y="13.5" width="13" height="2.5" rx="1" fill="#334155"/>
            {/* Glowing vertical overlap indicator (Emerald-500) */}
            <rect x="11.25" y="4" width="1.5" height="16" rx="0.75" fill="#10B981" />
          </svg>
          <span className="text-white font-semibold">SyncMap © 2026</span>
        </div>

        {/* Center: Minimalist tagline */}
        <span className="text-white/20 normal-case font-normal text-sm hidden md:inline">
          Visualizing timezone overlaps for distributed teams.
        </span>

        {/* Right: Clean Links */}
        <div className="flex items-center gap-8">
          <a href="/privacy" className="hover:text-emerald-500 transition-colors">
            Privacy & Terms
          </a>
          <a href="mailto:hello@syncmap.app" className="hover:text-emerald-500 transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}