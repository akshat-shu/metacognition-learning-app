module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/lib/prompts/judgeSynth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JUDGE_SYNTH_PROMPT",
    ()=>JUDGE_SYNTH_PROMPT
]);
const JUDGE_SYNTH_PROMPT = `You are reviewing a complete teaching session. The user was teaching an AI student who held specific misconceptions. Identify 3-4 pedagogically interesting moments — turning points, breakthrough questions, missed opportunities, places where the user changed approach.

For each moment, provide:
- turn_index
- type: "breakthrough" | "missed_opportunity" | "pivot" | "stumble"
- summary: what happened in 1-2 sentences
- why_it_mattered: the pedagogical significance
- try_next_time: specific suggestion

Then provide an aggregate growth summary: average per dimension, trend (improving/flat/declining), and one overall takeaway.

Also provide an ai_literacy block:
- probes_fired
- traps_fired
- caught
- missed
- missed_moments: array of {"turn_index","intent":"probe_minor|probe_trap","summary"}

Respond with ONLY this JSON:
{
  "moments": [...],
  "summary": {
    "averages": {"framing": n, "questions": n, "reasoning": n, "uncertainty": n, "calibration": n},
    "trend": "improving|flat|declining",
    "takeaway": "<one paragraph>"
  },
  "ai_literacy": {
    "probes_fired": n,
    "traps_fired": n,
    "caught": n,
    "missed": n,
    "missed_moments": [...]
  }
}`;
}),
"[project]/lib/schemas.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuditResultSchema",
    ()=>AuditResultSchema,
    "CoachResultSchema",
    ()=>CoachResultSchema,
    "GradeResultSchema",
    ()=>GradeResultSchema,
    "PreteachResultSchema",
    ()=>PreteachResultSchema,
    "SynthResultSchema",
    ()=>SynthResultSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
;
const MisconceptionStateSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "entrenched",
    "aware",
    "considering",
    "updating",
    "settled"
]);
const AuditResultSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    approve: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
    reason: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
});
const GradeResultSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    scores: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        framing: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(1).max(5),
        questions: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(1).max(5),
        reasoning: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(1).max(5),
        uncertainty: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(1).max(5),
        calibration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(1).max(5)
    }),
    emoticon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "delighted",
        "happy",
        "neutral",
        "concerned",
        "sad"
    ]),
    tag: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(40),
    evidence: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(200),
    state_transition: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        misc_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        from: MisconceptionStateSchema,
        to: MisconceptionStateSchema,
        reason: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    }).nullable()
});
const SynthResultSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    moments: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        turn_index: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
            "breakthrough",
            "missed_opportunity",
            "pivot",
            "stumble"
        ]),
        summary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        why_it_mattered: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        try_next_time: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    })),
    summary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        averages: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            framing: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
            questions: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
            reasoning: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
            uncertainty: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
            calibration: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
        }),
        trend: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
            "improving",
            "flat",
            "declining"
        ]),
        takeaway: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    }),
    ai_literacy: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        probes_fired: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nonnegative(),
        traps_fired: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nonnegative(),
        caught: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nonnegative(),
        missed: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nonnegative(),
        missed_moments: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            turn_index: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
            intent: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
                "probe_minor",
                "probe_trap"
            ]),
            summary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
        }))
    })
});
const CoachResultSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    nudge: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(400),
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "stuck",
        "hint_request",
        "transfer_check"
    ])
});
const PreteachResultSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    concept_primer: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(50).max(1500),
    misconception_preview: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(30).max(800),
    strategy_options: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(50)).length(4)
});
}),
"[project]/lib/session.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createSessionId",
    ()=>createSessionId,
    "getOrCreateSession",
    ()=>getOrCreateSession,
    "getSession",
    ()=>getSession,
    "getStoredSessionId",
    ()=>getStoredSessionId,
    "initializeSession",
    ()=>initializeSession,
    "readSessionBootstrap",
    ()=>readSessionBootstrap,
    "readStoredRecap",
    ()=>readStoredRecap,
    "saveSession",
    ()=>saveSession,
    "setSessionRecap",
    ()=>setSessionRecap,
    "setStoredSessionId",
    ()=>setStoredSessionId,
    "storeRecap",
    ()=>storeRecap,
    "storeSessionBootstrap",
    ()=>storeSessionBootstrap
]);
const SESSION_ID_STORAGE_KEY = "reverse-tutor:session-id";
const RECAP_STORAGE_PREFIX = "reverse-tutor:recap:";
const BOOTSTRAP_STORAGE_PREFIX = "reverse-tutor:bootstrap:";
const globalStore = globalThis;
function sessionMap() {
    if (!globalStore.__reverseTutorSessions__) {
        globalStore.__reverseTutorSessions__ = new Map();
    }
    return globalStore.__reverseTutorSessions__;
}
function createSessionId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `session-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}
function getSession(sessionId) {
    return sessionMap().get(sessionId);
}
function getOrCreateSession(sessionId, brief) {
    const existing = sessionMap().get(sessionId);
    if (existing) {
        return existing;
    }
    const miscStates = Object.fromEntries(brief.misconceptions.map((misconception)=>[
            misconception.id,
            "entrenched"
        ]));
    const created = {
        id: sessionId,
        brief,
        turns: [],
        scores: [],
        miscStates,
        strategyChoices: [],
        consumedProbes: [],
        turnIntents: [],
        coachNudgeCount: 0,
        pendingHintPenalty: 0,
        rollups: [],
        startedAt: Date.now()
    };
    sessionMap().set(sessionId, created);
    return created;
}
function saveSession(session) {
    sessionMap().set(session.id, session);
}
function setSessionRecap(sessionId, recap) {
    const session = sessionMap().get(sessionId);
    if (!session) {
        console.warn(`Cannot store recap: session ${sessionId} not found.`);
        return;
    }
    session.recap = recap;
    session.endedAt = Date.now();
    sessionMap().set(sessionId, session);
}
function initializeSession(sessionId, brief, strategyChoices) {
    const session = getOrCreateSession(sessionId, brief);
    session.strategyChoices = strategyChoices;
    sessionMap().set(sessionId, session);
    return session;
}
function getStoredSessionId() {
    if ("TURBOPACK compile-time truthy", 1) {
        return null;
    }
    //TURBOPACK unreachable
    ;
}
function setStoredSessionId(sessionId) {
    if ("TURBOPACK compile-time truthy", 1) {
        return;
    }
    //TURBOPACK unreachable
    ;
}
function storeRecap(sessionId, recap) {
    if ("TURBOPACK compile-time truthy", 1) {
        return;
    }
    //TURBOPACK unreachable
    ;
}
function readStoredRecap(sessionId) {
    if ("TURBOPACK compile-time truthy", 1) {
        return null;
    }
    //TURBOPACK unreachable
    ;
    const raw = undefined;
}
function storeSessionBootstrap(sessionId, payload) {
    if ("TURBOPACK compile-time truthy", 1) {
        return;
    }
    //TURBOPACK unreachable
    ;
}
function readSessionBootstrap(sessionId) {
    if ("TURBOPACK compile-time truthy", 1) {
        return null;
    }
    //TURBOPACK unreachable
    ;
    const raw = undefined;
}
}),
"[project]/lib/openrouter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "callJSONValidated",
    ()=>callJSONValidated,
    "callOpenRouter",
    ()=>callOpenRouter,
    "isNoEndpointError",
    ()=>isNoEndpointError,
    "streamOpenRouter",
    ()=>streamOpenRouter
]);
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
function getOpenRouterHeaders() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not set.");
    }
    return {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
        "X-Title": "Reverse Tutor"
    };
}
function cleanupJSON(raw) {
    return raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}
async function callOpenRouter({ model, messages, jsonMode = false, temperature = 0.7 }) {
    const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: getOpenRouterHeaders(),
        body: JSON.stringify({
            model,
            messages,
            temperature,
            ...jsonMode ? {
                response_format: {
                    type: "json_object"
                }
            } : {}
        })
    });
    if (!res.ok) {
        throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
        throw new Error("OpenRouter response missing message content.");
    }
    return content;
}
async function callJSONValidated(args, schema, retries = 1) {
    let currentArgs = args;
    for(let attempt = 0; attempt <= retries; attempt += 1){
        try {
            const raw = await callOpenRouter({
                ...currentArgs,
                jsonMode: true
            });
            const parsed = JSON.parse(cleanupJSON(raw));
            return schema.parse(parsed);
        } catch (error) {
            if (attempt === retries) {
                throw error;
            }
            currentArgs = {
                ...currentArgs,
                messages: [
                    ...currentArgs.messages,
                    {
                        role: "system",
                        content: "Your previous response was not valid JSON matching the required schema. Respond with ONLY valid JSON. No markdown, no prose, no comments."
                    }
                ]
            };
        }
    }
    throw new Error("JSON validation retries exhausted.");
}
async function streamOpenRouter(args, onToken) {
    const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: getOpenRouterHeaders(),
        body: JSON.stringify({
            model: args.model,
            messages: args.messages,
            temperature: args.temperature ?? 0.7,
            stream: true
        })
    });
    if (!res.ok || !res.body) {
        throw new Error(`OpenRouter stream ${res.status}: ${await res.text()}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let full = "";
    let lastMessageContent = "";
    while(true){
        const { value, done } = await reader.read();
        if (done) {
            break;
        }
        buffer += decoder.decode(value, {
            stream: true
        });
        while(true){
            const delimiterIndex = buffer.indexOf("\n\n");
            if (delimiterIndex === -1) {
                break;
            }
            const eventBlock = buffer.slice(0, delimiterIndex);
            buffer = buffer.slice(delimiterIndex + 2);
            const lines = eventBlock.split("\n").filter((line)=>line.startsWith("data:")).map((line)=>line.slice("data:".length).trim());
            for (const line of lines){
                if (line === "[DONE]") {
                    return full;
                }
                let parsed;
                try {
                    parsed = JSON.parse(line);
                } catch  {
                    continue;
                }
                const choice = parsed.choices?.[0];
                let token = choice?.delta?.content;
                if (typeof token !== "string" || token.length === 0) {
                    token = choice?.text;
                }
                if ((typeof token !== "string" || token.length === 0) && choice?.message?.content) {
                    const messageContent = choice.message.content;
                    if (messageContent.startsWith(lastMessageContent)) {
                        token = messageContent.slice(lastMessageContent.length);
                    } else {
                        token = messageContent;
                    }
                    lastMessageContent = messageContent;
                }
                if (typeof token === "string" && token.length > 0) {
                    full += token;
                    onToken(token);
                }
            }
        }
    }
    return full;
}
function isNoEndpointError(error) {
    if (!(error instanceof Error)) {
        return false;
    }
    return error.message.includes(" 404:") && error.message.toLowerCase().includes("no endpoints found");
}
}),
"[project]/app/api/session/end/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prompts$2f$judgeSynth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prompts/judgeSynth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/schemas.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/session.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$openrouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/openrouter.ts [app-route] (ecmascript)");
;
;
;
;
;
const SessionEndSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    sessionId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
const JUDGE_MODEL = process.env.JUDGE_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free";
async function POST(request) {
    const body = await request.json();
    const parsed = SessionEndSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json({
            error: "Invalid session end request."
        }, {
            status: 400
        });
    }
    const session = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSession"])(parsed.data.sessionId);
    if (!session) {
        return Response.json({
            error: "Session not found."
        }, {
            status: 404
        });
    }
    if (session.recap) {
        return Response.json({
            sessionId: session.id,
            recap: session.recap
        });
    }
    try {
        const recap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$openrouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callJSONValidated"])({
            model: JUDGE_MODEL,
            temperature: 0.2,
            messages: [
                {
                    role: "system",
                    content: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prompts$2f$judgeSynth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["JUDGE_SYNTH_PROMPT"]
                },
                {
                    role: "user",
                    content: JSON.stringify({
                        brief: session.brief,
                        turns: session.turns,
                        scores: session.scores,
                        turn_intents: session.turnIntents,
                        misc_states: session.miscStates,
                        strategy_choices: session.strategyChoices
                    })
                }
            ]
        }, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SynthResultSchema"], 1);
        session.endedAt = Date.now();
        session.recap = recap;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["saveSession"])(session);
        return Response.json({
            sessionId: session.id,
            recap
        });
    } catch (error) {
        console.error("Synthesis failed:", error);
        return Response.json({
            error: "Failed to synthesize session recap."
        }, {
            status: 502
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0mdw9it._.js.map