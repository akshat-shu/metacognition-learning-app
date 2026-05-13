import type { EmoticonState } from "@/lib/types";

type EmoticonFaceProps = {
  state: EmoticonState;
};

const MOUTH_BY_STATE: Record<EmoticonState, string> = {
  delighted: "M34 64 Q50 82 66 64",
  happy: "M35 64 Q50 76 65 64",
  neutral: "M36 66 L64 66",
  concerned: "M35 71 Q50 62 65 71",
  sad: "M34 74 Q50 56 66 74",
};

const EYE_BY_STATE: Record<EmoticonState, { left: string; right: string }> = {
  delighted: {
    left: "M30 42 Q34 38 38 42",
    right: "M62 42 Q66 38 70 42",
  },
  happy: {
    left: "M31 41 Q34 39 37 41",
    right: "M63 41 Q66 39 69 41",
  },
  neutral: {
    left: "M31 42 L37 42",
    right: "M63 42 L69 42",
  },
  concerned: {
    left: "M30 43 L38 41",
    right: "M62 41 L70 43",
  },
  sad: {
    left: "M30 41 L38 43",
    right: "M62 43 L70 41",
  },
};

export function EmoticonFace({ state }: EmoticonFaceProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <svg
        viewBox="0 0 100 100"
        className="mx-auto h-[120px] w-[120px] text-slate-700 transition-all duration-300"
        role="img"
        aria-label={`Student mood: ${state}`}
      >
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        <path
          d={EYE_BY_STATE[state].left}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={EYE_BY_STATE[state].right}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={MOUTH_BY_STATE[state]}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
