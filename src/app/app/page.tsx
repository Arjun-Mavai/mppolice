import { createClient } from "@supabase/supabase-js";
import Dashboard from "./Dashboard";
import { Category } from "@/data/quotes";
import { logger } from "@/lib/logger";

// Initialize Supabase Client (Server-side)
// We use the ANON key here because reading quotes is public/authenticated logic
// But since we are on the server, we could use Service Role if needed.
// Stick to Anon for security best practices unless filtered by RLS.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function Page() {
  // 1. Fetch all quotes from Supabase
  const { data: quotes, error } = await supabase
    .from('quotes')
    .select('*');

  if (error) {
    logger.error("Error fetching quotes:", error);
    // Fallback? Or Just show empty.
  }

  const allQuotes = quotes || [];

  // 2. Extract Categories dynamically
  // We can distinct query via SQL, or just derive here.
  // Converting Set to Array
  const categorySet = new Set<Category>();
  
  allQuotes.forEach((q: any) => {
      if (q.category) categorySet.add(q.category as Category);
  });
  
  // Sort categories (optional)
  const categories = Array.from(categorySet).sort();

  // 3. Pass data to Client Component
  // We pass 'quotes' as a prop so Dashboard doesn't need to fetch
  return (
    <Dashboard 
        initialCategories={categories.length > 0 ? categories : ['Spirituality', 'Wisdom']} 
        initialQuotes={allQuotes}
    />
  );
}
