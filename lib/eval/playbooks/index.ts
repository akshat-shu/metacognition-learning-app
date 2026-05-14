import type { Playbook } from '../types';
import probingTeacher from './probing-teacher';
import didacticTeacher from './didactic-teacher';
import offTopic from './off-topic';
import overconfidentWrong from './overconfident-wrong';

export const PLAYBOOKS: Playbook[] = [
  probingTeacher,
  didacticTeacher,
  offTopic,
  overconfidentWrong,
];

export function getPlaybook(id: string): Playbook | undefined {
  return PLAYBOOKS.find(p => p.id === id);
}
