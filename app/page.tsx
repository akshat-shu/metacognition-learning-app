import Link from 'next/link';
import { getAllBriefs } from '@/lib/briefs';

export default function Home() {
  const briefs = getAllBriefs();

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Reverse Tutor</h1>
        <p className="text-gray-500 mb-8">
          Teach an AI student. Learn to calibrate trust.
        </p>
        <div className="space-y-4">
          {briefs.map(brief => (
            <Link
              key={brief.id}
              href={`/preteach/${brief.id}`}
              className="block bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <h2 className="text-lg font-semibold text-gray-800">{brief.subject}</h2>
              <p className="text-sm text-gray-500 mt-1">{brief.scenario}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {brief.misconceptions.length} misconceptions
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {brief.persona.name}, {brief.persona.age}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
