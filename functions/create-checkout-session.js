// Example Node (Express-like) serverless function for Stripe Checkout
// Replace with your deployment platform's signature (Netlify / Vercel)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  try {
    const { tourId, customerEmail } = JSON.parse(req.body);
    // Lookup tour price by id (example)
    const price = 280000; // amount in cents (e.g. $2,800)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [{ price_data: { currency: 'usd', product_data: { name: '7-Day Baobab Safari' }, unit_amount: price }, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/thank-you.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/contact.html`,
    });
    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
