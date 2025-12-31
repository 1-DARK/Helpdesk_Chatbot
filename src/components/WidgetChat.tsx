import { useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { SuggestionChips } from "@/components/SuggestionChips";
import { useChat } from "@/hooks/useChat";

const SUGGESTIONS = [
  "B.Tech fees?",
  "Placements",
  "CSE details",
];

type ChatState = ReturnType<typeof useChat>;

interface WidgetChatProps {
  chatState?: ChatState;
}

export const WidgetChat = ({ chatState }: WidgetChatProps) => {
  const internalChatState = useChat();
  const { messages, isLoading, sendMessage } = chatState || internalChatState;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6 animate-fade-in">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-elegant mb-4">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="font-display font-bold text-lg text-foreground mb-1">
              Hi there! 👋
            </h3>
            <p className="text-muted-foreground text-sm mb-4 px-4">
              Ask me about admissions, fees, placements, and more.
            </p>
            <SuggestionChips
              suggestions={SUGGESTIONS}
              onSelect={sendMessage}
              disabled={isLoading}
            />
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              isStreaming={
                isLoading &&
                index === messages.length - 1 &&
                message.role === "assistant"
              }
            />
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-background">
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};