import 'dotenv/config';

async function clearCache() {
  const secret = process.env.ADMIN_SECRET_;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mppsc.zenscroll.app';

  if (!secret) {
    console.error('❌ Error: ADMIN_SECRET is not defined in .env');
    return;
  }

  console.log(`🧹 Clearing cache for tag: "blogs-list" at ${baseUrl}...`);

  try {
    const response = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secret,
        tag: 'blogs-list',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success! Cache cleared.');
      console.log('Server Response:', data);
    } else {
      console.error('❌ Failed to clear cache.');
      console.error('Status:', response.status);
      console.error('Error:', data);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

clearCache();
