import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { tourId } = req.body;
  const tours = {
    '7-day-baobab': { name: "7-Day Baobab Safari", price: 280000 },
    'kilimanjaro-trek': { name: "Kilimanjaro Trek", price: 240000 },
    // Add more tours dynamically
  };

  const tour = tours[tourId];
  if(!tour) return res.status(400).json({ error: 'Invalid tour' });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price_data: {
      currency: 'usd',
      product_data: { name: tour.name },
      unit_amount: tour.price
    }, quantity: 1 }],
    mode: 'payment',
    success_url: `${req.headers.origin}/contact.html?success=true`,
    cancel_url: `${req.headers.origin}/contact.html?canceled=true`
  });

  res.json({ url: session.url });
}
