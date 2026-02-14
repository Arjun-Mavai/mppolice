import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env.local', result.error);
}

console.log(
  'NEXT_PUBLIC_SUPABASE_URL:',
  process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Loaded' : 'Not Loaded'
);

import { supabase } from './lib/supabase';

async function check() {
  console.log('Checking card_users table...');
  const { data, error } = await supabase.from('card_users').select('*').limit(1);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Data sample:', data);
    if (data && data.length > 0) {
      console.log('Keys:', Object.keys(data[0]));
    } else {
      console.log('No users found to infer keys.');
      // If no users, try to insert one merely to see if it allows 'is_pro' or similar?
      // No, that might fail constraints.
      // Let's just hope there is a user (I saw /api/auth/me fetching, so likely yes).
    }
  }
}

check();
