"use client";

import { Drawer } from "@base-ui/react/drawer";
import { Menu, X } from "lucide-react";
import { RailNavContent } from "@/components/shell/Rail";

/** Hamburger trigger + off-canvas drawer, standing in for Rail below `lg:`. */
export function MobileNav() {
  return (
    <Drawer.Root swipeDirection="left">
      <Drawer.Trigger
        aria-label="Open navigation"
        className="flex h-8 w-8 items-center justify-center rounded-md text-text lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Drawer.Popup className="fixed inset-y-0 left-0 z-50 flex h-full w-60 flex-col border-r border-border bg-surface px-4 py-[22px] outline-none transition-transform duration-200 data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full">
          <Drawer.Close
            aria-label="Close navigation"
            className="absolute top-[22px] right-4 flex h-6 w-6 items-center justify-center text-faint"
          >
            <X className="h-4 w-4" />
          </Drawer.Close>
          <RailNavContent />
        </Drawer.Popup>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
