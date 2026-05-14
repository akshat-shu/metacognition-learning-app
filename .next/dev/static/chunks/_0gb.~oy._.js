(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/briefs/sample-physics.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sampleBrief",
    ()=>sampleBrief
]);
const sampleBrief = {
    id: "physics-freefall-1",
    subject: "Physics — gravity and free fall",
    scenario: "You just finished a physics class on gravity. The teacher said 'all objects fall at the same rate' but you don't really believe it because, like, obviously a bowling ball drops faster than a feather, right?",
    persona: {
        name: "Sam",
        age: 15,
        vibe: "curious but skeptical, slightly stubborn, uses casual language"
    },
    misconceptions: [
        {
            id: "heavier-faster",
            belief: "Heavier objects fall faster than lighter ones because they have more force pulling them down.",
            depth: 4,
            surface_when: "Discussion compares falling objects, gravity acting on different masses, or weight.",
            can_probe: false
        },
        {
            id: "air-irrelevant",
            belief: "Air resistance only matters for really light things like feathers or paper.",
            depth: 2,
            surface_when: "User mentions air, drag, or vacuum.",
            can_probe: false
        },
        {
            id: "force-equals-acceleration",
            belief: "More force always means more acceleration, even if the object is heavier.",
            depth: 3,
            surface_when: "User invokes Newton's second law or the F/m/a relationship.",
            can_probe: false
        }
    ],
    probe_claims: [
        {
            id: "g-is-10",
            claim: "g is like exactly 10 m/s² right?",
            truth: "g is approximately 9.8 m/s², commonly rounded to 10 for back-of-envelope calculations.",
            context_hint: "When doing a calculation involving free fall.",
            difficulty: "easy"
        },
        {
            id: "orbit-no-gravity",
            claim: "Astronauts float because there's no gravity up there.",
            truth: "Astronauts in low orbit experience about 90% of surface gravity. They float because they're in continuous free fall around Earth.",
            context_hint: "When the conversation drifts to space, orbit, or zero-g.",
            difficulty: "medium"
        }
    ],
    trap_claims: [
        {
            id: "vacuum-no-gravity",
            claim: "In a vacuum chamber there's no gravity, so things just kinda float.",
            truth: "Vacuum removes air resistance, not gravity. Objects in vacuum still fall.",
            context_hint: "When the user invokes vacuum to make their point."
        },
        {
            id: "mass-vs-weight-conflate",
            claim: "Mass is just how much an object weighs.",
            truth: "Mass measures amount of matter; weight is mass times gravitational acceleration.",
            context_hint: "When the user uses mass and weight interchangeably."
        }
    ],
    honest_topics: [
        "arithmetic with kinematic equations",
        "identifying what variables are given in a problem",
        "general statements about motion when not involving falling objects"
    ],
    objectives: [
        "Recognize that in vacuum, all objects fall at the same rate.",
        "Distinguish the role of air resistance from gravity.",
        "Understand that F=ma means heavier objects need proportionally more force for the same acceleration, which is exactly what gravity provides."
    ],
    preteach_focus: "Why objects fall at the same rate regardless of mass in the absence of air resistance, grounded in F = ma."
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/briefs/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_BRIEF_ID",
    ()=>DEFAULT_BRIEF_ID,
    "getBriefById",
    ()=>getBriefById,
    "listBriefs",
    ()=>listBriefs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$briefs$2f$sample$2d$physics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/briefs/sample-physics.ts [app-client] (ecmascript)");
;
const BRIEFS = {
    [__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$briefs$2f$sample$2d$physics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sampleBrief"].id]: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$briefs$2f$sample$2d$physics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sampleBrief"]
};
const DEFAULT_BRIEF_ID = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$briefs$2f$sample$2d$physics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sampleBrief"].id;
function getBriefById(id) {
    if (!id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$briefs$2f$sample$2d$physics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sampleBrief"];
    }
    return BRIEFS[id] ?? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$briefs$2f$sample$2d$physics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sampleBrief"];
}
function listBriefs() {
    return Object.values(BRIEFS);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/session.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return window.localStorage.getItem(SESSION_ID_STORAGE_KEY);
}
function setStoredSessionId(sessionId) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    window.localStorage.setItem(SESSION_ID_STORAGE_KEY, sessionId);
}
function storeRecap(sessionId, recap) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    window.localStorage.setItem(`${RECAP_STORAGE_PREFIX}${sessionId}`, JSON.stringify(recap));
}
function readStoredRecap(sessionId) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const raw = window.localStorage.getItem(`${RECAP_STORAGE_PREFIX}${sessionId}`);
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw);
    } catch (error) {
        console.error(`Failed to parse recap for session ${sessionId}:`, error);
        return null;
    }
}
function storeSessionBootstrap(sessionId, payload) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    window.sessionStorage.setItem(`${BOOTSTRAP_STORAGE_PREFIX}${sessionId}`, JSON.stringify(payload));
}
function readSessionBootstrap(sessionId) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const raw = window.sessionStorage.getItem(`${BOOTSTRAP_STORAGE_PREFIX}${sessionId}`);
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw);
    } catch (error) {
        console.error(`Failed to parse bootstrap for session ${sessionId}:`, error);
        return null;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/PreteachFlow.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PreteachFlow",
    ()=>PreteachFlow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$briefs$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/briefs/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/session.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function PreteachFlow({ briefId }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const brief = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PreteachFlow.useMemo[brief]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$briefs$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBriefById"])(briefId)
    }["PreteachFlow.useMemo[brief]"], [
        briefId
    ]);
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [starting, setStarting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [payload, setPayload] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PreteachFlow.useEffect": ()=>{
            let cancelled = false;
            void ({
                "PreteachFlow.useEffect": async ()=>{
                    setLoading(true);
                    setError("");
                    try {
                        const response = await fetch("/api/preteach/init", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                briefId
                            })
                        });
                        if (!response.ok) {
                            throw new Error("Could not load pre-teach content.");
                        }
                        const nextPayload = await response.json();
                        if (!cancelled) {
                            setPayload(nextPayload);
                        }
                    } catch (fetchError) {
                        if (!cancelled) {
                            setError(fetchError instanceof Error ? fetchError.message : "Pre-teach failed.");
                        }
                    } finally{
                        if (!cancelled) {
                            setLoading(false);
                        }
                    }
                }
            })["PreteachFlow.useEffect"]();
            return ({
                "PreteachFlow.useEffect": ()=>{
                    cancelled = true;
                }
            })["PreteachFlow.useEffect"];
        }
    }["PreteachFlow.useEffect"], [
        briefId
    ]);
    const toggleStrategy = (option)=>{
        setSelected((current)=>{
            if (current.includes(option)) {
                return current.filter((entry)=>entry !== option);
            }
            if (current.length >= 2) {
                return current;
            }
            return [
                ...current,
                option
            ];
        });
    };
    const startSession = async ()=>{
        if (selected.length === 0 || starting) {
            return;
        }
        setStarting(true);
        setError("");
        try {
            const response = await fetch("/api/session/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    briefId,
                    strategyChoices: selected
                })
            });
            if (!response.ok) {
                throw new Error("Could not start session.");
            }
            const data = await response.json();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storeSessionBootstrap"])(data.sessionId, {
                opener: data.opener,
                miscStates: data.miscStates
            });
            router.push(`/session/${data.sessionId}`);
        } catch (startError) {
            setError(startError instanceof Error ? startError.message : "Session start failed.");
        } finally{
            setStarting(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-4 md:p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-md",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-semibold uppercase tracking-widest text-slate-500",
                        children: "Pre-teach"
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 108,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "mt-2 text-2xl font-bold text-slate-900",
                        children: [
                            "Teach ",
                            brief.persona.name,
                            " about ",
                            brief.subject
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 109,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PreteachFlow.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm",
                children: "Preparing your primer..."
            }, void 0, false, {
                fileName: "[project]/components/PreteachFlow.tsx",
                lineNumber: 115,
                columnNumber: 9
            }, this) : null,
            !loading && payload && step === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-semibold text-slate-900",
                        children: "Before you teach"
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 122,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700",
                        children: payload.concept_primer
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 123,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setStep(1),
                        className: "mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white",
                        children: "I get it, continue"
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 126,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PreteachFlow.tsx",
                lineNumber: 121,
                columnNumber: 9
            }, this) : null,
            !loading && payload && step === 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-semibold text-slate-900",
                        children: "What you're walking into"
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 138,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700",
                        children: payload.misconception_preview
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 139,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900",
                        children: [
                            "Sam will mostly reason correctly. Sometimes they'll have misconceptions. Sometimes they'll be confidently wrong about side details. ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Don't over-correct."
                            }, void 0, false, {
                                fileName: "[project]/components/PreteachFlow.tsx",
                                lineNumber: 144,
                                columnNumber: 67
                            }, this),
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Don't under-challenge."
                            }, void 0, false, {
                                fileName: "[project]/components/PreteachFlow.tsx",
                                lineNumber: 145,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 142,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setStep(2),
                        className: "mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white",
                        children: "Got it"
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 147,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PreteachFlow.tsx",
                lineNumber: 137,
                columnNumber: 9
            }, this) : null,
            !loading && payload && step === 2 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-semibold text-slate-900",
                        children: "Pick your approach"
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 159,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-sm text-slate-600",
                        children: "Choose one or two strategy options."
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 160,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 flex flex-wrap gap-2",
                        children: payload.strategy_options.map((option)=>{
                            const active = selected.includes(option);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>toggleStrategy(option),
                                className: `rounded-full border px-3 py-1.5 text-sm ${active ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700"}`,
                                children: option
                            }, option, false, {
                                fileName: "[project]/components/PreteachFlow.tsx",
                                lineNumber: 165,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 161,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        disabled: selected.length === 0 || starting,
                        onClick: startSession,
                        className: "mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300",
                        children: starting ? "Starting..." : "Start session"
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 180,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PreteachFlow.tsx",
                lineNumber: 158,
                columnNumber: 9
            }, this) : null,
            error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/PreteachFlow.tsx",
                lineNumber: 192,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/components/PreteachFlow.tsx",
        lineNumber: 106,
        columnNumber: 5
    }, this);
}
_s(PreteachFlow, "fTbjs03ABTlTlu2OQJxe+db/ZMY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = PreteachFlow;
var _c;
__turbopack_context__.k.register(_c, "PreteachFlow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
"[project]/node_modules/next/navigation.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=_0gb.~oy._.js.map