import { Check, XCircle } from 'lucide-react';

type StatusBadgeProps = {
  status: boolean;
  trueLabel: string;
  falseLabel: string;
};

export const StatusBadge = ({ status, trueLabel, falseLabel }: Readonly<StatusBadgeProps>) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        status
          ? 'bg-green-500/10 text-green-700 dark:text-green-400'
          : 'bg-red-500/10 text-red-700 dark:text-red-400'
      }`}
    >
      {status ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {status ? trueLabel : falseLabel}
    </span>
  );
};
