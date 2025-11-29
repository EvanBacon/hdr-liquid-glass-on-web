import React, { useEffect, useRef } from "react";
import { useGlassHighlight } from "./use-glass-highlight";
import { cn } from "@/lib/utils";

import { Slot } from "@radix-ui/react-slot";
import { View } from "react-native";

export const Glass = (
  props: React.ComponentProps<typeof View> & {
    isInteractive?: boolean;
    asChild?: boolean;
  }
) => {
  const { className, isInteractive = false, ref, asChild, ...rest } = props;

  const elRef = useRef(null);

  const Component = asChild ? Slot : View;

  const highlightData = useRef({});
  const { attachEvents, detachEvents } = useGlassHighlight({
    getEl: () => elRef.current,
    enabled: isInteractive,
    data: highlightData.current,
  });

  useEffect(() => {
    attachEvents();
    return () => detachEvents();
  });

  return (
    <Component
      ref={(el) => {
        if (ref && typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
        elRef.current = el;
      }}
      className={cn(
        "bg-sf-grouped-bg-2/75 shadow-sf-light-glass backdrop-blur-lg touch-none",
        className
      )}
      {...rest}
    />
  );
};
