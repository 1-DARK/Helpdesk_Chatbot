import { cn } from "@/lib/utils";

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

export const SuggestionChips = ({ suggestions, onSelect, disabled }: SuggestionChipsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className={cn(
            "px-4 py-2 text-sm rounded-full border border-border",
            "bg-card text-foreground hover:bg-muted",
            "transition-all duration-200 hover:shadow-chat",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "animate-fade-in"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};
