import { FloatingWidget } from "@/components/FloatingWidget";
import { WidgetChat } from "@/components/WidgetChat";
import { Helmet } from "react-helmet-async";
import { useChat } from "@/hooks/useChat";

const Index = () => {
  const chatState = useChat();

  return (
    <>
      <Helmet>
        <title>JUET Guna AI Assistant - Admissions, Placements & More</title>
        <meta
          name="description"
          content="Get instant answers about JUET Guna admissions, fees, placements, courses, and more. AI-powered assistant for Jaypee University of Engineering and Technology."
        />
      </Helmet>

      <div className="min-h-screen bg-transparent">
        <FloatingWidget onRefresh={chatState.clearChat}>
          <WidgetChat chatState={chatState} />
        </FloatingWidget>
      </div>
    </>
  );
};

export default Index;
