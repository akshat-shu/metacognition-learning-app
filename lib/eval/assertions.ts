import type { Assertion, PlaybookTrace } from './types';

// Patterns commonly emitted by "AI tutor" mode that Sam should never produce.
const LATEX_PATTERN = /\\\(|\\\[|\\frac|\\text|\$\$|\\sqrt|\\sum/;
const STRUCTURED_TUTOR_PATTERN = /^\s*(\d+\.\s|\*\*|##\s|\-\s\*\*)/m;

export function samNeverProducesLaTeX(): Assertion {
  return {
    name: 'Sam never produces LaTeX',
    check: (trace) => {
      const offending = trace.turns.find(t => LATEX_PATTERN.test(t.studentReply));
      return offending
        ? { pass: false, detail: `turn ${offending.turnIndex}: ${offending.studentReply.slice(0, 120)}` }
        : { pass: true };
    },
  };
}

export function samNeverLecturesInTutorMode(): Assertion {
  return {
    name: 'Sam does not switch into structured tutor mode (numbered lists, headings)',
    check: (trace) => {
      const offending = trace.turns.find(t => STRUCTURED_TUTOR_PATTERN.test(t.studentReply));
      return offending
        ? { pass: false, detail: `turn ${offending.turnIndex}: ${offending.studentReply.slice(0, 120)}` }
        : { pass: true };
    },
  };
}

export function atLeastOneStateAdvance(): Assertion {
  return {
    name: 'At least one misconception advanced',
    check: (trace) => {
      const advances = trace.turns
        .map(t => t.stateTransition)
        .filter((t): t is NonNullable<typeof t> => !!t);
      return advances.length > 0
        ? { pass: true, detail: `${advances.length} advance(s)` }
        : { pass: false, detail: 'no state_transition fired' };
    },
  };
}

export function noStateAdvances(): Assertion {
  return {
    name: 'No misconception advanced (weak teaching should not progress)',
    check: (trace) => {
      const advances = trace.turns
        .map(t => t.stateTransition)
        .filter((t): t is NonNullable<typeof t> => !!t && t.from !== t.to);
      return advances.length === 0
        ? { pass: true }
        : { pass: false, detail: `${advances.length} unexpected advance(s)` };
    },
  };
}

export function avgScoreAtLeast(dimension: string, threshold: number): Assertion {
  return {
    name: `Average ${dimension} >= ${threshold}`,
    check: (trace) => {
      const values = trace.turns
        .map(t => t.scores?.[dimension])
        .filter((v): v is number => typeof v === 'number');
      if (values.length === 0) return { pass: false, detail: 'no scores captured' };
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return avg >= threshold
        ? { pass: true, detail: `avg=${avg.toFixed(2)}` }
        : { pass: false, detail: `avg=${avg.toFixed(2)} < ${threshold}` };
    },
  };
}

export function avgScoreAtMost(dimension: string, threshold: number): Assertion {
  return {
    name: `Average ${dimension} <= ${threshold}`,
    check: (trace) => {
      const values = trace.turns
        .map(t => t.scores?.[dimension])
        .filter((v): v is number => typeof v === 'number');
      if (values.length === 0) return { pass: false, detail: 'no scores captured' };
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return avg <= threshold
        ? { pass: true, detail: `avg=${avg.toFixed(2)}` }
        : { pass: false, detail: `avg=${avg.toFixed(2)} > ${threshold}` };
    },
  };
}

export function samMentionsTopicWithin(turnsToCheck: number, pattern: RegExp): Assertion {
  return {
    name: `Sam mentions on-topic content within ${turnsToCheck} turn(s) (${pattern.source})`,
    check: (trace) => {
      const slice = trace.turns.slice(0, turnsToCheck);
      const hit = slice.some(t => pattern.test(t.studentReply));
      return hit
        ? { pass: true }
        : { pass: false, detail: 'no on-topic mention found' };
    },
  };
}

export function noTurnsErrored(): Assertion {
  return {
    name: 'All turns completed without error',
    check: (trace) => {
      const errors = trace.turns.filter(t => t.error);
      if (trace.setupError) {
        return { pass: false, detail: `setup error: ${trace.setupError}` };
      }
      return errors.length === 0
        ? { pass: true }
        : { pass: false, detail: `${errors.length} turn(s) errored` };
    },
  };
}

export function calibrationAtMostWhenOverconfident(threshold: number): Assertion {
  return {
    name: `Calibration <= ${threshold} on weak [I'm sure] moves`,
    check: (trace: PlaybookTrace) => {
      const sureTurns = trace.turns.filter(t => /^\[I.?m sure\]/i.test(t.userMessage));
      if (sureTurns.length === 0) {
        return { pass: false, detail: 'no [I\'m sure] turns to evaluate' };
      }
      const overconfident = sureTurns.filter(t => (t.scores?.calibration ?? 5) > threshold);
      return overconfident.length === 0
        ? { pass: true, detail: `${sureTurns.length} sure-turn(s), all <= ${threshold}` }
        : { pass: false, detail: `${overconfident.length}/${sureTurns.length} sure-turn(s) above threshold` };
    },
  };
}
