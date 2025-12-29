import { GraduationCap, ExternalLink } from "lucide-react";

export const ChatHeader = () => {
  return (
    <header className="bg-card border-b border-border px-4 py-4 shadow-chat">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-elegant">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">
              JUET Guna Assistant
            </h1>
            <p className="text-xs text-muted-foreground">
              Your AI guide to admissions, placements & more
            </p>
          </div>
        </div>
        <a
          href="https://www.juet.ac.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <span className="hidden sm:inline">Visit Website</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};
