import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingWidgetProps {
  children: React.ReactNode;
}

export const FloatingWidget = ({ children }: FloatingWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Chat Window */}
      <div
        className={cn(
          "absolute bottom-16 right-0 w-[360px] h-[520px]",
          "bg-background rounded-2xl shadow-2xl border border-border overflow-hidden",
          "transition-all duration-300 ease-out origin-bottom-right",
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
        style={{
          maxWidth: "calc(100vw - 32px)",
          maxHeight: "calc(100vh - 100px)",
        }}
      >
        {/* Widget Header */}
        <div className="flex items-center justify-between px-4 py-3 gradient-primary">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-primary-foreground font-display font-semibold text-sm block">
                JUET HelpDesk
              </span>
              <span className="text-primary-foreground/70 text-xs">
                Ask me anything
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Chat Content */}
        <div className="h-[calc(100%-64px)]">{children}</div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-elegant",
          "flex items-center justify-center",
          "transition-all duration-300 ease-out",
          "hover:scale-110 active:scale-95",
          isOpen
            ? "bg-muted text-muted-foreground"
            : "gradient-primary text-primary-foreground"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Pulse Animation when closed */}
      {!isOpen && (
        <span className="absolute inset-0 rounded-full gradient-primary opacity-30 animate-ping pointer-events-none" />
      )}
    </div>
  );
};
