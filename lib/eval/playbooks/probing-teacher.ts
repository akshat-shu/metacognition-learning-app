import type { Playbook } from '../types';
import {
  atLeastOneStateAdvance,
  avgScoreAtLeast,
  noTurnsErrored,
  samNeverLecturesInTutorMode,
  samNeverProducesLaTeX,
} from '../assertions';

const probingTeacher: Playbook = {
  id: 'probing-teacher',
  name: 'Probing teacher (Socratic)',
  description:
    'Ideal teacher behavior: open-ended questions, thought experiments, analogies. We expect at least one misconception to shift and Sam to stay in-character.',
  briefId: 'physics-freefall-1',
  strategies: ['Use a thought experiment', 'Ask Sam to predict first'],
  turns: [
    'what do you think actually happens when you drop a bowling ball and a feather at the same time?',
    'okay so what role do you think air plays in that?',
    'imagine we did the same drop inside a vacuum chamber — what would you predict?',
    'why do you think a heavier object would feel a bigger pull from gravity in the first place?',
    'if F=ma and gravity pulls harder on heavier things, what cancels out when you actually compute the acceleration?',
  ],
  assertions: [
    noTurnsErrored(),
    samNeverProducesLaTeX(),
    samNeverLecturesInTutorMode(),
    atLeastOneStateAdvance(),
    avgScoreAtLeast('questions', 3.0),
    avgScoreAtLeast('reasoning', 2.8),
  ],
};

export default probingTeacher;
