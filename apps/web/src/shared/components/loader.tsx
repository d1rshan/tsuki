import { cn } from "@/shared/lib/utils";

export function Loader({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex min-h-64 items-center justify-center", className)}
      role="status"
      aria-label="Loading"
    >
      <div
        aria-hidden="true"
        className="relative size-5 animate-[spin_1s_steps(8)_infinite] motion-reduce:animate-none"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <span
            key={index}
            className="absolute inset-0"
            style={{ transform: `rotate(${index * 45}deg)` }}
          >
            <span
              className="absolute top-0 left-1/2 h-1.5 w-[2px] -translate-x-1/2 rounded-full bg-muted-foreground"
              style={{ opacity: (index + 1) / 8 }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
