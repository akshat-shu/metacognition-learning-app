import type { Brief } from "@/lib/types";

export const sampleBrief: Brief = {
  id: "physics-freefall-1",
  subject: "Physics — gravity and free fall",
  scenario:
    "You just finished a physics class on gravity. The teacher said 'all objects fall at the same rate' but you don't really believe it because, like, obviously a bowling ball drops faster than a feather, right?",
  persona: {
    name: "Sam",
    age: 15,
    vibe: "curious but skeptical, slightly stubborn, uses casual language",
  },
  misconceptions: [
    {
      id: "heavier-faster",
      belief:
        "Heavier objects fall faster than lighter ones because they have more force pulling them down.",
      depth: 4,
      surface_when:
        "They ask about comparing falling objects or about gravity acting on different masses.",
    },
    {
      id: "air-irrelevant",
      belief:
        "Air resistance only matters for really light things like feathers or paper.",
      depth: 2,
      surface_when: "They bring up air, drag, or why a feather falls slowly.",
    },
    {
      id: "force-equals-acceleration",
      belief:
        "More force always means more acceleration, even if the object is heavier.",
      depth: 3,
      surface_when:
        "They mention Newton's second law or push on the relationship between F, m, and a.",
    },
  ],
  objectives: [
    "Recognize that in vacuum, all objects fall at the same rate.",
    "Distinguish the role of air resistance from gravity.",
    "Understand that F=ma means heavier objects need proportionally more force for the same acceleration, which is exactly what gravity provides.",
  ],
};
