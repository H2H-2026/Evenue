import { Loader2 } from "lucide-react";

export function RouteFallback() {
  return (
    <div className="flex h-full min-h-[60vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
    </div>
  );
}
