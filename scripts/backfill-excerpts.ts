import { env } from '@/lib/env';
import { db } from '@/db';
import { contentBlogs } from '@/db/schema';
import { eq, isNull } from 'drizzle-orm';

async function backfillExcerpts() {
  console.log('Starting description/excerpt backfill...');

  // Fetch blogs that need updates (missing excerpt OR missing description)
  // We will update both to be sure
  const blogs = await db.select().from(contentBlogs);
  console.log(`Found ${blogs.length} blogs to check/update.`);

  let updatedCount = 0;

  for (const blog of blogs) {
    let textContent = '';
    const content = blog.content as any;

    if (content && typeof content === 'object') {
      if (typeof content.hi === 'string') {
        textContent = content.hi;
      } else if (typeof content.en === 'string') {
        textContent = content.en;
      } else if (Array.isArray(content)) {
        textContent = content.map((b: any) => (typeof b.text === 'string' ? b.text : '')).join(' ');
      } else if (Array.isArray(content.blocks)) {
        textContent = content.blocks
          .map((b: any) => (typeof b.text === 'string' ? b.text : ''))
          .join(' ');
      } else if (content.hi && Array.isArray(content.hi)) {
        // Handle the specific format user showed: { hi: [ { type: 'p', text: '...' } ] }
        textContent = content.hi
          .map((b: any) => (typeof b.text === 'string' ? b.text : ''))
          .join(' ');
      } else if (content.en && Array.isArray(content.en)) {
        textContent = content.en
          .map((b: any) => (typeof b.text === 'string' ? b.text : ''))
          .join(' ');
      }
    }

    // Ensure textContent is a string
    textContent = String(textContent || '');
    const plainText = textContent.replace(/<[^>]*>?/gm, '');

    // Generate description if missing or empty
    let newDescription = blog.description;
    if (!newDescription || newDescription.trim() === '') {
      newDescription = plainText.substring(0, 300) + (plainText.length > 300 ? '...' : '');
    }

    // Generate excerpt (keep it sync with description or slightly shorter)
    const newExcerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');

    // Update if changed
    if (blog.description !== newDescription || blog.excerpt !== newExcerpt) {
      await db
        .update(contentBlogs)
        .set({
          description: newDescription,
          excerpt: newExcerpt,
        })
        .where(eq(contentBlogs.id, blog.id));
      updatedCount++;
      console.log(`Updated blog: ${blog.title}`);
    }
  }

  console.log(`Backfill complete! Updated ${updatedCount} blogs.`);
}

backfillExcerpts().catch(console.error);
