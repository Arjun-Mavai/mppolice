import 'dotenv/config';
import { db } from './src/db';
import { contentBlogs } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function checkBlogs() {
  const blogs = await db.select().from(contentBlogs).limit(5);
  console.log(
    'Sample Blogs:',
    JSON.stringify(
      blogs.map((b) => ({
        id: b.id,
        title: b.title,
        isFreeAccess: b.isFreeAccess,
        isPremium: b.isPremium,
      })),
      null,
      2
    )
  );
}

checkBlogs();
