
import { getTests } from '@/data/tests';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, Trophy } from 'lucide-react';

// ISR: Revalidate every week
export const revalidate = 604800;

export default async function TestsPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const params = await searchParams;
  const tag = params.tag;
  const tests = await getTests({ unitId: tag });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
              Mavai Test Series
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-lg">
              Master your preparation with our premium full-length and unit tests.
            </p>
          </div>
          {/* Admin Link for convenience during dev */}
          {process.env.NODE_ENV === 'development' && (
             <Link href="/admin/content-manager" className="text-xs text-blue-500 hover:underline">
               Admin Upload
             </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <div 
              key={test.id} 
              className="group relative flex flex-col justify-between p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                    test.type === 'FLT' 
                      ? 'bg-purple-100 text-purple-700 border-purple-200' 
                      : test.type === 'CSAT'
                      ? 'bg-orange-100 text-orange-700 border-orange-200'
                      : 'bg-blue-100 text-blue-700 border-blue-200'
                  }`}>
                  {test.type}
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 pr-12 leading-tight">
                  {test.title}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                  {test.description || "No description provided."}
                </p>
                
                <div className="flex items-center gap-4 text-xs font-medium text-neutral-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {test.durationMinutes} mins
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    {test.totalMarks} Marks
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                <Link href={`/tests/${test.slug}`} className="block w-full">
                  <Button className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 font-semibold shadow-lg">
                    Start Test
                  </Button>
                </Link>
              </div>
            </div>
          ))}

          {tests.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">No Tests Available Yet</h3>
              <p className="text-neutral-500 mt-2 mb-6">Tests are being prepared. Check back soon!</p>
              <Link href="/admin/content-manager">
                <Button variant="outline">Upload Test Data</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
