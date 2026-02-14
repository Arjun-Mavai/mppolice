import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env: Record<string, string> = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Checking card_users table...');
  const { data, error } = await supabase.from('card_users').select('*').limit(1);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Data found:', !!data?.length);
    if (data && data.length > 0) {
      console.log('Keys:', Object.keys(data[0]));
    } else {
      console.log('No users found.');
    }
  }
}

check();
