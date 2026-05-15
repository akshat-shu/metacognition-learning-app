import { Brief } from '../types';

export const sampleBrief: Brief = {
  id: 'physics-freefall-1',
  subject: 'Physics — gravity and free fall',
  scenario: "You just finished a physics class on gravity. The teacher said 'all objects fall at the same rate' but you don't really believe it.",
  persona: { name: 'Sam', age: 15, vibe: 'curious but skeptical, slightly stubborn, casual language' },
  misconceptions: [
    {
      id: 'heavier-faster',
      belief: 'Heavier objects fall faster than lighter ones because they have more force pulling them down.',
      depth: 4,
      surface_when: 'Discussion compares falling objects, gravity acting on different masses, or weight.',
      can_probe: false,
    },
    {
      id: 'air-irrelevant',
      belief: 'Air resistance only matters for really light things like feathers or paper.',
      depth: 2,
      surface_when: 'User mentions air, drag, or vacuum.',
      can_probe: false,
    },
    {
      id: 'force-equals-acceleration',
      belief: 'More force always means more acceleration, even if the object is heavier.',
      depth: 3,
      surface_when: "User invokes Newton's second law or the F/m/a relationship.",
      can_probe: false,
    },
  ],
  probe_claims: [
    {
      id: 'g-is-10',
      claim: 'g is like exactly 10 m/s² right?',
      truth: 'g is approximately 9.8 m/s², commonly rounded to 10 for back-of-envelope calculations.',
      context_hint: 'When doing a calculation involving free fall.',
      difficulty: 'easy',
    },
    {
      id: 'orbit-no-gravity',
      claim: "Astronauts float because there's no gravity up there.",
      truth: "Astronauts in low orbit experience ~90% of surface gravity. They float because they're in continuous free fall around the Earth.",
      context_hint: 'When the conversation drifts to space, orbit, or zero-g.',
      difficulty: 'medium',
    },
  ],
  trap_claims: [
    {
      id: 'vacuum-no-gravity',
      claim: "In a vacuum chamber there's no gravity, so things just kinda float.",
      truth: 'Vacuum removes air resistance, not gravity. Objects in vacuum still fall.',
      context_hint: 'When the user invokes vacuum to make their point.',
    },
    {
      id: 'mass-vs-weight-conflate',
      claim: 'Mass is just how much an object weighs.',
      truth: 'Mass measures the amount of matter; weight is mass × gravitational acceleration. The same mass weighs different amounts on the Moon vs Earth.',
      context_hint: 'When the user uses "mass" or "weight" interchangeably.',
    },
  ],
  honest_topics: [
    'arithmetic with the kinematic equations',
    'identifying what variables are given in a problem',
    'general statements about motion when not involving falling objects',
  ],
  objectives: [
    'Recognize that in vacuum, all objects fall at the same rate.',
    'Distinguish the role of air resistance from gravity.',
    'Understand that F = ma means heavier objects need proportionally more force for the same acceleration — which is exactly what gravity provides.',
  ],
  preteach_focus: 'Why objects fall at the same rate regardless of mass (in the absence of air resistance), grounded in F = ma.',
};
