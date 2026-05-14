import { Brief } from '../types';
import { sampleBrief } from './sample-physics';

const briefs: Record<string, Brief> = {
  [sampleBrief.id]: sampleBrief,
};

export function getBrief(id: string): Brief | undefined {
  return briefs[id];
}

export function getAllBriefs(): Brief[] {
  return Object.values(briefs);
}
