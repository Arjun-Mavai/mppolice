
// Login page must never be cached to prevent stale auth redirects
export const dynamic = 'force-dynamic';

import LoginPage from "@/components/signin";

export default function Page() {
  return <LoginPage />;
}
