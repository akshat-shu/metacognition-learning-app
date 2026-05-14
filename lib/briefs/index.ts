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
