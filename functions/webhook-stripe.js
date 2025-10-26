// Example Stripe webhook handler (verify signatures in production)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  const payload = req.body;
  // TODO: verify signature header (Stripe-Signature) in production
  // handle checkout.session.completed, payment_intent.succeeded, etc.
  res.json({ received: true });
};
