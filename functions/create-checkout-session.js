// Baobab Bound Adventures - Stripe Checkout Session Creation
// This is a serverless function for creating Stripe checkout sessions

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse the request body
    const { tourId, tourName, price, currency = 'USD' } = JSON.parse(event.body);

    // Validate required fields
    if (!tourId || !tourName || !price) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: tourId, tourName, price' }),
      };
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: tourName,
              description: `Safari tour booking for ${tourName}`,
              images: [`https://baobabboundadventures.com/images/tours/${tourId}.webp`],
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.SITE_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/tours/${tourId}`,
      metadata: {
        tourId: tourId,
        tourName: tourName,
      },
      customer_email: '', // Will be collected during checkout
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'JP', 'CN', 'IN', 'BR', 'ZA'],
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create checkout session',
        message: error.message 
      }),
    };
  }
};

// For local development/testing
if (require.main === module) {
  const testEvent = {
    httpMethod: 'POST',
    body: JSON.stringify({
      tourId: '7-day-baobab-safari',
      tourName: '7-Day Baobab Safari',
      price: 2850,
      currency: 'USD'
    })
  };
  
  exports.handler(testEvent, {})
    .then(result => console.log('Test result:', result))
    .catch(error => console.error('Test error:', error));
}
