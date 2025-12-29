import { useState } from "react";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingWidgetProps {
  children: React.ReactNode;
}

export const FloatingWidget = ({ children }: FloatingWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Chat Window */}
      <div
        className={cn(
          "absolute bottom-16 right-0 w-[380px] h-[600px] max-h-[80vh]",
          "bg-background rounded-2xl shadow-2xl border border-border overflow-hidden",
          "transition-all duration-300 ease-out origin-bottom-right",
          isOpen && !isMinimized
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
        style={{
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        {/* Widget Header */}
        <div className="flex items-center justify-between px-4 py-3 gradient-primary">
          <span className="text-primary-foreground font-display font-semibold text-sm">
            JUET Guna Assistant
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg hover:bg-primary-foreground/10 transition-colors"
              aria-label="Minimize"
            >
              <Minimize2 className="w-4 h-4 text-primary-foreground" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-primary-foreground/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="h-[calc(100%-52px)]">{children}</div>
      </div>

      {/* Minimized State */}
      {isOpen && isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className={cn(
            "absolute bottom-16 right-0 px-4 py-3 rounded-2xl",
            "bg-card border border-border shadow-elegant",
            "flex items-center gap-3 animate-slide-up",
            "hover:shadow-chat transition-shadow"
          )}
        >
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground">Continue chat</span>
        </button>
      )}

      {/* Floating Button */}
      <button
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
            setIsMinimized(false);
          } else {
            setIsOpen(true);
            setIsMinimized(false);
          }
        }}
        className={cn(
          "w-14 h-14 rounded-full shadow-elegant",
          "flex items-center justify-center",
          "transition-all duration-300 ease-out",
          "hover:scale-110 active:scale-95",
          isOpen
            ? "bg-muted text-muted-foreground rotate-0"
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
