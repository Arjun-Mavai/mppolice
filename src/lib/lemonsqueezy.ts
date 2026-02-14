// Basic Lemon Squeezy checkout link generator
// In a real app, you would use their API to generate a link for a specific user.
// For now, we use a direct payment link concept but we should use the API to pass custom data (userId).

// Since we want to keep it "Simple" but "Production Ready", we should generate a checkout URL
// that includes the user's ID in the "checkout[custom][user_id]" query param.

// YOU MUST REPLACE THIS WITH YOUR ACTUAL LEMON SQUEEZY STORE ID AND PRODUCT ID
const LS_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const LS_VARIANT_ID = process.env.LEMONSQUEEZY_VARIANT_ID;
const LS_API_KEY = process.env.LEMONSQUEEZY_API_KEY;

export async function createCheckoutSession(userId: string, userEmail: string) {
  if (!LS_STORE_ID || !LS_VARIANT_ID || !LS_API_KEY) {
    console.warn('Lemon Squeezy credentials missing. Using fallback/demo link.');
    // Fallback for demo purposes if env vars are not set
    return 'https://lemonsqueezy.com/checkout?demo=true';
  }

  try {
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: `Bearer ${LS_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: LS_STORE_ID,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: LS_VARIANT_ID,
              },
            },
          },
          attributes: {
            checkout_data: {
              email: userEmail,
              custom: {
                user_id: userId,
              },
            },
            product_options: {
              redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?success=true`,
            },
          },
        },
      }),
    });

    const data = await response.json();
    return data.data.attributes.url;
  } catch (error) {
    console.error('Error creating Lemon Squeezy checkout:', error);
    return null;
  }
}
