import { FloatingWidget } from "@/components/FloatingWidget";
import { WidgetChat } from "@/components/WidgetChat";
import { Helmet } from "react-helmet-async";

const Widget = () => {
  return (
    <>
      <Helmet>
        <title>JUET Guna Chat Widget</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Transparent background for embedding */}
      <div className="min-h-screen bg-transparent">
        <FloatingWidget>
          <WidgetChat />
        </FloatingWidget>
      </div>
    </>
  );
};

export default Widget;
