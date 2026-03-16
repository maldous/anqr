import { AlertCircle } from "lucide-react";

export function AnalyzeWarnings({ warnings }: Readonly<{ warnings: string[] }>) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 shadow-sm">
      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
      <div className="text-sm text-amber-700 dark:text-amber-400">
        {warnings.map((warning) => (
          <p key={warning}>• {warning}</p>
        ))}
      </div>
    </div>
  );
}
