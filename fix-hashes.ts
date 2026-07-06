import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fix() {
  const freshClient = createClient({ url: 'file:mppolice_local_dev.db' });
  const oldClient = createClient({ url: 'file:mppolice_local_dev.db.bak' });
  const remoteClient = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN! });

  const freshRes = await freshClient.execute('SELECT * FROM __drizzle_migrations ORDER BY created_at ASC');
  const allHashes = freshRes.rows; // Array of { id, hash, created_at }
  
  // We want to insert these into oldClient and remoteClient for any that are missing
  
  for (const client of [oldClient, remoteClient]) {
    const existing = await client.execute('SELECT hash FROM __drizzle_migrations');
    const existingSet = new Set(existing.rows.map(r => r.hash));
    
    // BUT WAIT! We ONLY want to sync up to 0020 (index 20). Because 0021 (the support tables) IS NOT IN TURSO YET!
    // So if we just insert 0021's hash, Drizzle will think it's applied, but the tables won't exist!
    // Let's only sync hashes up to 0020.
    const hashesToSync = allHashes.slice(0, 21); // 0 to 20

    for (const h of hashesToSync) {
      if (!existingSet.has(h.hash)) {
        await client.execute({
          sql: 'INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)',
          args: [h.hash, h.created_at]
        });
        console.log(`Inserted missing hash ${h.hash}`);
      }
    }
  }
}
fix();
