module.exports = [
"[project]/lib/briefs/sample-physics.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/lib/briefs/index.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_BRIEF_ID",
    ()=>DEFAULT_BRIEF_ID,
    "getBriefById",
    ()=>getBriefById,
    "listBriefs",
    ()=>listBriefs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$briefs$2f$sample$2d$physics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/briefs/sample-physics.ts [app-ssr] (ecmascript)");
;
const BRIEFS = {
    [__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$briefs$2f$sample$2d$physics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sampleBrief"].id]: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$briefs$2f$sample$2d$physics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sampleBrief"]
};
const DEFAULT_BRIEF_ID = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$briefs$2f$sample$2d$physics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sampleBrief"].id;
function getBriefById(id) {
    if (!id) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$briefs$2f$sample$2d$physics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sampleBrief"];
    }
    return BRIEFS[id] ?? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$briefs$2f$sample$2d$physics$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sampleBrief"];
}
function listBriefs() {
    return Object.values(BRIEFS);
}
}),
"[project]/lib/session.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/components/PreteachFlow.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PreteachFlow",
    ()=>PreteachFlow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$briefs$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/briefs/index.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/session.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function PreteachFlow({ briefId }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const brief = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$briefs$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getBriefById"])(briefId), [
        briefId
    ]);
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [starting, setStarting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [payload, setPayload] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        void (async ()=>{
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
        })();
        return ()=>{
            cancelled = true;
        };
    }, [
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
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$session$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["storeSessionBootstrap"])(data.sessionId, {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-4 md:p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-md",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-semibold uppercase tracking-widest text-slate-500",
                        children: "Pre-teach"
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 108,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
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
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm",
                children: "Preparing your primer..."
            }, void 0, false, {
                fileName: "[project]/components/PreteachFlow.tsx",
                lineNumber: 115,
                columnNumber: 9
            }, this) : null,
            !loading && payload && step === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-semibold text-slate-900",
                        children: "Before you teach"
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 122,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700",
                        children: payload.concept_primer
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 123,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
            !loading && payload && step === 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-semibold text-slate-900",
                        children: "What you're walking into"
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 138,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700",
                        children: payload.misconception_preview
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 139,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900",
                        children: [
                            "Sam will mostly reason correctly. Sometimes they'll have misconceptions. Sometimes they'll be confidently wrong about side details. ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Don't over-correct."
                            }, void 0, false, {
                                fileName: "[project]/components/PreteachFlow.tsx",
                                lineNumber: 144,
                                columnNumber: 67
                            }, this),
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
            !loading && payload && step === 2 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-semibold text-slate-900",
                        children: "Pick your approach"
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 159,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-sm text-slate-600",
                        children: "Choose one or two strategy options."
                    }, void 0, false, {
                        fileName: "[project]/components/PreteachFlow.tsx",
                        lineNumber: 160,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 flex flex-wrap gap-2",
                        children: payload.strategy_options.map((option)=>{
                            const active = selected.includes(option);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
            error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
}),
];

//# sourceMappingURL=_0skzy4~._.js.map