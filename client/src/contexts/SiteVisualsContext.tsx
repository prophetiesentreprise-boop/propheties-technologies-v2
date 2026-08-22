import { visualDefaults, type VisualSlot } from "@/data/siteContent";
import { trpc } from "@/lib/trpc";
import { createContext, useContext, type ReactNode } from "react";

type SiteVisualsContextValue = {
  getVisual: (slot: VisualSlot) => string;
  isLoading: boolean;
};

const SiteVisualsContext = createContext<SiteVisualsContextValue>({
  getVisual: (slot) => visualDefaults[slot],
  isLoading: false,
});

export function SiteVisualsProvider({ children }: { children: ReactNode }) {
  const visuals = trpc.visuals.list.useQuery();
  const overrides = new Map((visuals.data ?? []).map((visual) => [visual.slot, visual.imageUrl]));

  return (
    <SiteVisualsContext.Provider value={{
      getVisual: (slot) => overrides.get(slot) ?? visualDefaults[slot],
      isLoading: visuals.isLoading,
    }}>
      {children}
    </SiteVisualsContext.Provider>
  );
}

export function useSiteVisual(slot: VisualSlot) {
  return useContext(SiteVisualsContext).getVisual(slot);
}
