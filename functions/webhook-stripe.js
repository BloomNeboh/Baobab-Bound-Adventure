import Stripe from 'stripe';
import nodemailer from 'nodemailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

export default async function handler(req, res) {
  const event = req.body;

  if(event.type === 'checkout.session.completed'){
    const session = event.data.object;
    const msg = {
      from: 'Baobab Bound <info@baobabbound.com>',
      to: session.customer_email,
      subject: `Booking Confirmation: ${session.display_items[0].custom.name}`,
      text: `Thank you for booking ${session.display_items[0].custom.name}. Your adventure awaits!`
    };
    await transporter.sendMail(msg);
  }
  res.status(200).end();
}
