import { sampleBrief } from "@/lib/briefs/sample-physics";
import type { Brief } from "@/lib/types";

const BRIEFS: Record<string, Brief> = {
  [sampleBrief.id]: sampleBrief,
};

export const DEFAULT_BRIEF_ID = sampleBrief.id;

export function getBriefById(id?: string): Brief {
  if (!id) {
    return sampleBrief;
  }
  return BRIEFS[id] ?? sampleBrief;
}

export function listBriefs(): Brief[] {
  return Object.values(BRIEFS);
}
