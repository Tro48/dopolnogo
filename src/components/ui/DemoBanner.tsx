import { demoNotice } from "@/content/site";
import { cn } from "@/lib/cn";

/**
 * Плашка видна без прокрутки: `full` — на лендинге, `short` — в шапке Mini App,
 * где места мало. Полный текст в обоих случаях доступен через `title`.
 */
export function DemoBanner({
  variant = "full",
  className,
}: {
  variant?: "full" | "short";
  className?: string;
}) {
  return (
    <p
      title={demoNotice.full}
      className={cn(
        "border-amber/40 bg-amber/15 text-text border-b px-4 py-2 text-center text-sm",
        className,
      )}
    >
      {variant === "full" ? demoNotice.full : demoNotice.short}
    </p>
  );
}
