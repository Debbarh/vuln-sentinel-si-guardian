import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Adapted from the shadcn new-york-v4 registry; native values, validity and FormData are preserved. */
const NativeSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { containerClassName?: string }>(
  ({ className, containerClassName, multiple, ...props }, ref) => <div data-slot="native-select-wrapper" className={cn("relative min-w-0 w-full", containerClassName)}>
    <select ref={ref} data-slot="native-select" multiple={multiple} className={cn(
      "h-10 w-full min-w-0 max-w-full appearance-none rounded-lg border border-input bg-card py-2 ps-3 pe-9 text-base text-foreground shadow-xs transition-colors focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-danger/25 md:text-sm",
      multiple && "h-auto min-h-24 appearance-auto pe-3", className,
    )} {...props} />
    {!multiple && <ChevronDown data-slot="native-select-icon" className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />}
  </div>,
);
NativeSelect.displayName = "NativeSelect";

function NativeSelectOption(props: React.ComponentProps<"option">) { return <option data-slot="native-select-option" {...props} />; }
function NativeSelectOptGroup(props: React.ComponentProps<"optgroup">) { return <optgroup data-slot="native-select-optgroup" {...props} />; }
export { NativeSelect, NativeSelectOption, NativeSelectOptGroup };
