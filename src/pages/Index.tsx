import { useRef, useEffect } from "react";
import { Bot, RotateCcw } from "lucide-react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { SuggestionChips } from "@/components/SuggestionChips";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/useChat";
import { Helmet } from "react-helmet-async";

const SUGGESTIONS = [
  "What are the B.Tech fees?",
  "Placement statistics",
  "CSE department details",
  "Application deadline",
];

const Index = () => {
  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <>
      <Helmet>
        <title>JUET Guna AI Assistant - Admissions, Placements & More</title>
        <meta
          name="description"
          content="Get instant answers about JUET Guna admissions, fees, placements, courses, and more. AI-powered assistant for Jaypee University of Engineering and Technology."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <ChatHeader />

        {/* Chat Area */}
        <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-elegant mb-6">
                  <Bot className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                  Welcome to JUET Guna
                </h2>
                <p className="text-muted-foreground text-sm max-w-md mb-8">
                  I can help you with information about admissions, placements, fees, courses, and more. Ask me anything!
                </p>
                <SuggestionChips
                  suggestions={SUGGESTIONS}
                  onSelect={handleSuggestion}
                  disabled={isLoading}
                />
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
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
                ))}
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border p-4">
            <div className="max-w-3xl mx-auto space-y-3">
              {messages.length > 0 && (
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    className="text-muted-foreground hover:text-foreground text-xs gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Start new chat
                  </Button>
                </div>
              )}
              <ChatInput onSend={sendMessage} isLoading={isLoading} />
              <p className="text-center text-xs text-muted-foreground">
                Powered by AI • Toll-free: 1800-121-884444
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Index;
