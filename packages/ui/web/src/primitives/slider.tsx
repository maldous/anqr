import * as SliderPrimitive from "@radix-ui/react-slider";
import { Minus, Plus } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useDynamicTestId } from "../dynamic-testid";
import { cn } from "../utils";

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, min = 0, max = 100, step = 1, value, onValueChange, disabled, ...props }, ref) => {
  const { t } = useTranslation();
  const testId = useDynamicTestId(props, "slider");

  const handleDecrement = () => {
    if (!value) return;
    const newVal = Math.round(Math.max(min, value[0] - step) * 1e10) / 1e10;
    onValueChange?.([newVal]);
  };

  const handleIncrement = () => {
    if (!value) return;
    const newVal = Math.round(Math.min(max, value[0] + step) * 1e10) / 1e10;
    onValueChange?.([newVal]);
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        data-testid={`${testId}-decrement`}
        onClick={handleDecrement}
        disabled={disabled || !value || value[0] <= min}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
        aria-label={t("common.decrease", "Decrease")}
      >
        <Minus className="h-3 w-3" />
      </button>
      <SliderPrimitive.Root
        ref={ref}
        data-testid={testId}
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        className={cn("relative flex w-full touch-none select-none items-center", className)}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      <button
        type="button"
        data-testid={`${testId}-increment`}
        onClick={handleIncrement}
        disabled={disabled || !value || value[0] >= max}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
        aria-label={t("common.increase", "Increase")}
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
