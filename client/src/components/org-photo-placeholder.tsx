import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";
export function OrgPhotoPlaceholder({ name, className }: { name: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`Photo placeholder for ${name}`}
      data-testid="org-photo-placeholder"
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-3 border border-border/60 bg-secondary/40 px-6 text-center text-muted-foreground",
        className,
      )}
    >
      <ImageIcon aria-hidden className="h-9 w-9 opacity-40" strokeWidth={1.25} />
      <span className="text-sm">Organization photo</span>
      <span className="text-xs opacity-70">Placeholder</span>
    </div>
  );
}
