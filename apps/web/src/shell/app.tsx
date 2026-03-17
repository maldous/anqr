import { QRGeneratorProvider } from "../../../../packages/application/generator/src/hooks/useQRGenerator";
import { AppContent } from "./app-content";

export default function App() {
  return (
    <QRGeneratorProvider>
      <AppContent />
    </QRGeneratorProvider>
  );
}
