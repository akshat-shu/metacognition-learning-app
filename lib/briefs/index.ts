import { Brief } from '../types';
import { sampleBrief } from './sample-physics';

const briefs = new Map<string, Brief>([[sampleBrief.id, sampleBrief]]);

export function getBrief(id: string): Brief | undefined {
  return briefs.get(id);
}

export function getAllBriefs(): Brief[] {
  return Array.from(briefs.values());
}

export function registerBrief(brief: Brief): void {
  briefs.set(brief.id, brief);
}

export function getBuiltInBriefs(): Brief[] {
  return [sampleBrief];
}

// Stores a learner-generated brief in the in-memory registry. Returns the id.
export function registerBrief(brief: Brief): string {
  briefs[brief.id] = brief;
  return brief.id;
}

export function generateBriefId(): string {
  return `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
