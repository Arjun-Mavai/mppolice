import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { QUOTES } from '../data/quotes';

// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local (Need SERVICE_ROLE_KEY)');
  process.exit(1);
}

// Create client with Service Role Key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seed() {
  console.log(`Seeding ${QUOTES.length} quotes...`);

  // Transform quotes to match DB schema (if needed)
  // Our DB schema: text, author, category, verified (optional)
  const quotesToInsert = QUOTES.map((q) => ({
    text: q.text,
    author: q.author,
    category: q.category,
    verified: q.category === 'Scientific Proven' || q.category === 'Ted Wisdom', // Simple logic for verify
  }));

  const { error } = await supabase.from('quotes').insert(quotesToInsert);

  if (error) {
    console.error('Error insert quotes:', error);
  } else {
    console.log('Successfully seeded quotes!');
  }
}

seed();
