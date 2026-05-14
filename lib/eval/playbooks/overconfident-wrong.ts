import type { Playbook } from '../types';
import {
  calibrationAtMostWhenOverconfident,
  noTurnsErrored,
  samNeverProducesLaTeX,
} from '../assertions';

const overconfidentWrong: Playbook = {
  id: 'overconfident-wrong',
  name: 'Overconfident + wrong (uncertainty chip miscalibrated)',
  description:
    'User uses the [I\'m sure] chip on flat-wrong or weak moves. The grader should penalize calibration (score <= 2). This validates that the uncertainty chip is being consumed by evaluation.',
  briefId: 'physics-freefall-1',
  strategies: ['Use a thought experiment'],
  turns: [
    "[I'm sure] heavier objects definitely fall faster, that's just physics.",
    "[I'm sure] air resistance has nothing to do with it.",
    "[I'm sure] F=ma means a heavier object accelerates more under the same gravity.",
  ],
  assertions: [
    noTurnsErrored(),
    samNeverProducesLaTeX(),
    calibrationAtMostWhenOverconfident(2),
  ],
};

export default overconfidentWrong;
