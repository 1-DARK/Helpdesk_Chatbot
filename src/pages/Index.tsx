import { FloatingWidget } from "@/components/FloatingWidget";
import { WidgetChat } from "@/components/WidgetChat";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>JUET Guna AI Assistant - Admissions, Placements & More</title>
        <meta
          name="description"
          content="Get instant answers about JUET Guna admissions, fees, placements, courses, and more. AI-powered assistant for Jaypee University of Engineering and Technology."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <FloatingWidget>
          <WidgetChat />
        </FloatingWidget>
      </div>
    </>
  );
};

export default Index;
