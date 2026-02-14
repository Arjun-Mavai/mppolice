import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { supabase } from './lib/supabase';

async function check() {
  console.log('Checking card_users table...');
  const { data, error } = await supabase.from('card_users').select('*').limit(1);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Data:', data);
    if (data && data.length > 0) {
      console.log('Keys:', Object.keys(data[0]));
    } else {
      console.log('No users found in table.');
    }
  }
}

check();
