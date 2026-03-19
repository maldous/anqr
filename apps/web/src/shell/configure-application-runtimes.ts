import { configureAnalyzePlatformRuntime } from "@/application/analyze";
import { configureGeneratorRuntime } from "@/application/generator";
import { defaultBrowserCanvasFactory, downloadUrl, saveFileNative } from "@/platform/browser";
import { prepareInterstitial, showInterstitial } from "@/platform/native";
import {
  generateQArtInWorker,
  terminateQArtWorker,
  terminateValidationWorker,
  validateInWorker,
} from "@/platform/worker";

configureGeneratorRuntime({
  canvasFactory: defaultBrowserCanvasFactory,
  download: { downloadUrl },
  interstitials: { prepareInterstitial, showInterstitial },
  qartWorker: { generateQArtInWorker, terminateQArtWorker },
  validationWorker: { validateInWorker, terminateValidationWorker },
});

configureAnalyzePlatformRuntime({ saveFileNative });
