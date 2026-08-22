import { contentDefaults, type ContentSlot } from "@/data/siteContent";
import { trpc } from "@/lib/trpc";
import { createContext, useContext, type ReactNode } from "react";

type SiteContentContextValue = {
  getContent: (slot: string) => string;
  isLoading: boolean;
};

const SiteContentContext = createContext<SiteContentContextValue>({
  getContent: (slot) => contentDefaults[slot as ContentSlot]?.value ?? "",
  isLoading: false,
});

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const content = trpc.content.list.useQuery();
  const overrides = new Map((content.data ?? []).map((entry) => [entry.key, entry.value]));

  return <SiteContentContext.Provider value={{
    getContent: (slot) => overrides.get(slot) ?? contentDefaults[slot as ContentSlot]?.value ?? "",
    isLoading: content.isLoading,
  }}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(slot: ContentSlot | string) {
  return useContext(SiteContentContext).getContent(slot);
}

export function useSiteContents() {
  return useContext(SiteContentContext).getContent;
}
