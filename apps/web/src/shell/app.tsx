import { QRGeneratorProvider } from "../../../../packages/application/generator/src/hooks/useQRGenerator";
import { useQRStore } from "../state/qr-store";
import { AppContent } from "./app-content";

export default function App() {
  return (
    <QRGeneratorProvider useStore={useQRStore}>
      <AppContent />
    </QRGeneratorProvider>
  );
}
