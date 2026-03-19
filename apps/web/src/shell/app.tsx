import "./configure-application-runtimes";
import { QRGeneratorProvider } from "@/application/generator";
import { useQRStore } from "../state/qr-store";
import { AppContent } from "./app-content";
import { scheduleTrackEvent } from "./schedule-track-event";

export default function App() {
  return (
    <QRGeneratorProvider useStore={useQRStore} scheduleTrackEvent={scheduleTrackEvent}>
      <AppContent />
    </QRGeneratorProvider>
  );
}
