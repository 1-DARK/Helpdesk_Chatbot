import { useRef, useEffect } from "react";
import { Bot, ExternalLink } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { SuggestionChips } from "@/components/SuggestionChips";
import { useChat } from "@/hooks/useChat";
import { Helmet } from "react-helmet-async";

const SUGGESTIONS = [
  "B.Tech fees?",
  "Placements",
  "CSE department",
  "Apply now",
];

const Embed = () => {
  const { messages, isLoading, sendMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <Helmet>
        <title>JUET Guna Chat</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* Compact Header */}
        <header className="flex items-center justify-between px-4 py-3 gradient-primary">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-sm text-primary-foreground">
              JUET Guna Assistant
            </span>
          </div>
          <a
            href="https://www.juet.ac.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-primary-foreground" />
          </a>
        </header>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-6 animate-fade-in">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center shadow-elegant mb-4">
                <Bot className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                Hi there! 👋
              </h3>
              <p className="text-muted-foreground text-sm mb-5 max-w-xs">
                Ask me anything about JUET Guna - admissions, placements, fees, and more.
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
        <div className="p-3 border-t border-border bg-background/80 backdrop-blur-sm">
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            Powered by AI
          </p>
        </div>
      </div>
    </>
  );
};

export default Embed;
