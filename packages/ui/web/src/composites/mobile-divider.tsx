import { GripHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export function MobileDivider({
  onDrag,
  onDragEnd,
}: Readonly<{
  onDrag: (deltaY: number) => void;
  onDragEnd: () => void;
}>) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const lastY = useRef<number>(0);
  const dividerRef = useRef<HTMLButtonElement>(null);

  // Handle mouse/touch start
  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true);
    lastY.current = clientY;
  }, []);

  // Handle mouse/touch move
  const handleDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return;
      const deltaY = clientY - lastY.current;
      lastY.current = clientY;
      onDrag(deltaY);
    },
    [isDragging, onDrag],
  );

  // Handle mouse/touch end
  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd();
    }
  }, [isDragging, onDragEnd]);

  // Mouse events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleDragStart(e.clientY);
    },
    [handleDragStart],
  );

  // Touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        handleDragStart(e.touches[0].clientY);
      }
    },
    [handleDragStart],
  );

  // Global event listeners for drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleDragMove(e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        handleDragMove(e.touches[0].clientY);
      }
    };

    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    // Add listeners to document for global tracking
    document.addEventListener("mousemove", handleMouseMove, { passive: false });
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);

    // Prevent text selection during drag
    document.body.style.userSelect = "none";
    document.body.style.touchAction = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
      document.body.style.userSelect = "";
      document.body.style.touchAction = "";
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  return (
    <button
      ref={dividerRef}
      type="button"
      aria-label={t(
        "accessibility.resizePanels",
        "Resize panels. Use arrow keys to adjust.",
      )}
      className={`
        md:hidden
        h-4 py-3.5 -my-3.5 w-full
        flex items-center justify-center
        bg-muted border-y border-border
        cursor-row-resize
        touch-none
        select-none
        transition-all duration-150
        appearance-none p-0 rounded-none
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1
        ${
          isDragging
            ? "bg-accent shadow-md border-accent-foreground/20"
            : "hover:bg-accent/50 active:bg-accent hover:shadow-sm"
        }
      `}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          onDrag(e.key === "ArrowUp" ? -10 : 10);
          onDragEnd();
        }
      }}
    >
      <GripHorizontal
        className={`h-5 w-5 transition-all duration-150 ${isDragging ? "text-foreground scale-110" : "text-muted-foreground"}`}
      />
    </button>
  );
}
