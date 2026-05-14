import type { Playbook } from '../types';
import {
  avgScoreAtMost,
  noTurnsErrored,
  samNeverProducesLaTeX,
} from '../assertions';

const didacticTeacher: Playbook = {
  id: 'didactic-teacher',
  name: 'Didactic teacher (lectures, no questions)',
  description:
    'Bad teacher behavior: flat assertions, no questions, no reasoning surfaced. Grader should score "questions" low. Sam should still stay in character.',
  briefId: 'physics-freefall-1',
  strategies: ['Walk through a concrete example'],
  turns: [
    'Heavier and lighter objects fall at the same rate. It is a fact.',
    'Just trust me. Air resistance is what makes the feather slower, not gravity.',
    'F equals m times a. The masses cancel. End of story.',
    "You're wrong. Galileo proved this hundreds of years ago.",
    "Stop arguing and just memorize that g equals 9.8.",
  ],
  assertions: [
    noTurnsErrored(),
    samNeverProducesLaTeX(),
    avgScoreAtMost('questions', 2.5),
    avgScoreAtMost('reasoning', 2.8),
  ],
};

export default didacticTeacher;
