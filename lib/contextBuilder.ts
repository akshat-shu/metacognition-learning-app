import { Session, TurnIntent, SamMode, TurnScore, CoachTrigger } from './types';
import { buildStudentSystemPrompt } from './prompts/student';
import { buildBriefSystemMessage } from './prompts/brief';
import { buildIntentPrelude } from './prompts/intentPrelude';
import { buildGradePrompt, describeIntent } from './prompts/judgeGrade';
import { buildCoachPrompt } from './prompts/judgeCoach';
import { buildSynthPrompt } from './prompts/judgeSynth';
import { buildAuditPrompt } from './prompts/judgeAudit';

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

// Student: full brief in system, full transcript, intent prelude per turn
export function buildStudentMessages(
  session: Session,
  intent: TurnIntent,
  mode: SamMode,
): Message[] {
  const messages: Message[] = [
    { role: 'system', content: buildStudentSystemPrompt(session.brief) },
    { role: 'system', content: buildBriefSystemMessage(session.brief, session.miscStates) },
    { role: 'system', content: buildIntentPrelude(intent, mode, session.brief, session.miscStates) },
  ];

  // Add conversation history (full for student)
  for (const turn of session.turns) {
    if (turn.role === 'user') {
      messages.push({ role: 'user', content: `<user_message>${turn.content}</user_message>` });
    } else {
      messages.push({ role: 'assistant', content: turn.content });
    }
  }

  return messages;
}

// Grader: subject+scenario only (no full brief), last 4 turns, recent scores, intent of previous Sam turn
export function buildGraderMessages(
  session: Session,
  userMessage: string,
  lastIntent: TurnIntent,
): Message[] {
  const intentDesc = describeIntent(lastIntent);
  const messages: Message[] = [
    { role: 'system', content: `Subject: ${session.brief.subject}\nScenario: ${session.brief.scenario}` },
    { role: 'system', content: buildGradePrompt(intentDesc, session.miscStates, lastIntent, session.brief.misconceptions) },
  ];

  // Last 4 turns as context
  const recentTurns = session.turns.slice(-4);
  const turnsText = recentTurns.map(t =>
    `${t.role === 'user' ? 'User' : 'Student'}: ${t.content}`
  ).join('\n\n');

  // Recent scores
  const recentScores = session.scores.slice(-4);
  const scoresText = recentScores.length > 0
    ? JSON.stringify(recentScores.map(s => ({ tag: s.tag, scores: s.scores, emoticon: s.emoticon })))
    : 'No previous scores yet.';

  messages.push({
    role: 'user',
    content: `Recent turns:\n${turnsText}\n\nRecent scores: ${scoresText}\n\nMisconception states: ${JSON.stringify(session.miscStates)}\n\nStrategy choices: ${session.strategyChoices.join(', ')}\n\nNEW user message to grade:\n${userMessage}`,
  });

  return messages;
}

// Coach: brief in system, last 4 turns, misc states, strategy choices
export function buildCoachMessages(
  session: Session,
  trigger: CoachTrigger,
): Message[] {
  const recentTurns = session.turns.slice(-4);
  const turnsText = recentTurns.map(t =>
    `${t.role === 'user' ? 'User' : 'Student'}: ${t.content}`
  ).join('\n\n');

  const recentScores = session.scores.slice(-4);
  const scoresText = JSON.stringify(recentScores.map(s => ({ tag: s.tag, scores: s.scores })));

  return [
    { role: 'system', content: `Brief:\n${JSON.stringify({ subject: session.brief.subject, scenario: session.brief.scenario, misconceptions: session.brief.misconceptions, objectives: session.brief.objectives })}` },
    {
      role: 'user',
      content: buildCoachPrompt(trigger, session.miscStates, turnsText + '\n\nRecent scores: ' + scoresText, session.strategyChoices),
    },
  ];
}

// Synthesizer: full brief, full transcript, all scores
export function buildSynthMessages(session: Session): Message[] {
  const turnsText = session.turns.map((t, i) => {
    const intentLabel = t.intent ? ` [intent: ${t.intent.type}]` : '';
    return `${t.role === 'user' ? 'User' : 'Student'}${intentLabel}: ${t.content}`;
  }).join('\n\n');

  const scoresText = JSON.stringify(session.scores);

  // Gather probe/trap data for AI literacy
  const probeIntents = session.turnIntents.filter(i => i.type === 'probe_minor' || i.type === 'probe_trap');
  const probeInfo = probeIntents.map(i => {
    if (i.type === 'probe_minor') {
      const p = session.brief.probe_claims.find(p => p.id === (i as any).probe_id);
      return p ? { type: 'probe', claim: p.claim, truth: p.truth } : null;
    } else {
      const t = session.brief.trap_claims.find(t => t.id === (i as any).trap_id);
      return t ? { type: 'trap', claim: t.claim, truth: t.truth } : null;
    }
  }).filter(Boolean);

  const reflectionBlock = session.reflection
    ? `\n\nUser's self-reflection at end of session: "${session.reflection}"`
    : '';

  return [
    { role: 'system', content: buildSynthPrompt() },
    {
      role: 'user',
      content: `Brief: ${JSON.stringify({ subject: session.brief.subject, scenario: session.brief.scenario, objectives: session.brief.objectives, misconceptions: session.brief.misconceptions })}\n\nFull transcript:\n${turnsText}\n\nAll scores: ${scoresText}\n\nMisconception final states: ${JSON.stringify(session.miscStates)}\n\nProbes and traps used: ${JSON.stringify(probeInfo)}${reflectionBlock}`,
    },
  ];
}

// Auditor: brief, recent turns, intent, draft
export function buildAuditMessages(
  session: Session,
  intent: TurnIntent,
  draft: string,
): Message[] {
  const recentTurns = session.turns.slice(-4);
  const turnsText = recentTurns.map(t =>
    `${t.role === 'user' ? 'User' : 'Student'}: ${t.content}`
  ).join('\n\n');

  return [
    { role: 'system', content: buildAuditPrompt() },
    { role: 'system', content: `Brief:\n${JSON.stringify(session.brief)}` },
    {
      role: 'user',
      content: `Intent: ${JSON.stringify(intent)}\n\nRecent turns:\n${turnsText}\n\nDraft to check:\n${draft}`,
    },
  ];
}
