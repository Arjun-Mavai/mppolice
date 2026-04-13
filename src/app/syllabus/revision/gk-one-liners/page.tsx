import { redirect } from 'next/navigation';

interface Props {
  searchParams: Promise<{ subject?: string }>;
}

/** Legacy URL → quiz layout (sub-nav). */
export default async function LegacyGkOneLinersRedirect({ searchParams }: Props) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  if (sp.subject?.trim()) {
    q.set('subject', sp.subject.trim());
  }
  const suffix = q.toString();
  redirect(`/syllabus/quiz/revision/gk-one-liners${suffix ? `?${suffix}` : ''}`);
}
