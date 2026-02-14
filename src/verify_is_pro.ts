import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('--- Verification Start ---');

  // 1. Get a user (assuming one exists)
  const { data: users, error: userError } = await supabase.from('card_users').select('*').limit(1);

  if (userError || !users?.length) {
    console.error('No users found to verify against.');
    return;
  }

  const user = users[0];
  console.log(`Testing with user: ${user.email} (ID: ${user.id})`);
  console.log(`Current DB is_pro: ${user.is_pro}`);

  // 2. Validate API logic by simulating what the API does
  // The API executes: .select('id, email, name, created_at, is_pro').eq('id', userId).single();
  const { data: apiSim, error: apiError } = await supabase
    .from('card_users')
    .select('id, email, name, created_at, is_pro')
    .eq('id', user.id)
    .single();

  if (apiError) {
    console.error('API Simulation Failed:', apiError);
  } else {
    console.log('API Simulation Result:', apiSim);
    if (apiSim.is_pro === user.is_pro) {
      console.log('SUCCESS: API query fetches is_pro correctly.');
    } else {
      console.error('FAILURE: API query mismatch.');
    }
  }

  console.log('--- Verification End ---');
}

verify();
