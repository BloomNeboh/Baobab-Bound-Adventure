// Baobab Bound Adventures - Stripe Webhook Handler
// This handles Stripe webhook events for payment processing

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    // Verify the webhook signature
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Webhook signature verification failed' }),
    };
  }

  // Handle the event
  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(stripeEvent.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook processing failed' }),
    };
  }
};

// Handle successful checkout session completion
async function handleCheckoutSessionCompleted(session) {
  console.log('Checkout session completed:', session.id);
  
  try {
    // Extract booking information
    const tourId = session.metadata.tourId;
    const tourName = session.metadata.tourName;
    const customerEmail = session.customer_email;
    const amountTotal = session.amount_total;
    const currency = session.currency;
    
    // Create booking record in your database
    const booking = {
      id: session.id,
      tourId: tourId,
      tourName: tourName,
      customerEmail: customerEmail,
      amount: amountTotal / 100, // Convert from cents
      currency: currency.toUpperCase(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      paymentStatus: 'paid',
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent,
    };
    
    // Save to database (implement your database logic here)
    await saveBooking(booking);
    
    // Send confirmation email
    await sendBookingConfirmation(booking);
    
    // Send notification to admin
    await sendAdminNotification(booking);
    
    console.log('Booking processed successfully:', booking.id);
  } catch (error) {
    console.error('Error processing checkout session:', error);
    throw error;
  }
}

// Handle successful payment
async function handlePaymentSucceeded(paymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  try {
    // Update booking status if needed
    await updateBookingPaymentStatus(paymentIntent.id, 'paid');
    
    // Send payment confirmation
    await sendPaymentConfirmation(paymentIntent);
    
    console.log('Payment processed successfully:', paymentIntent.id);
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  
  try {
    // Update booking status
    await updateBookingPaymentStatus(paymentIntent.id, 'failed');
    
    // Send payment failure notification
    await sendPaymentFailureNotification(paymentIntent);
    
    console.log('Payment failure processed:', paymentIntent.id);
  } catch (error) {
    console.error('Error processing payment failure:', error);
    throw error;
  }
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Invoice payment succeeded:', invoice.id);
  // Implement subscription payment logic if needed
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);
  // Implement subscription logic if needed
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  // Implement subscription update logic if needed
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  // Implement subscription cancellation logic if needed
}

// Database operations (implement based on your database)
async function saveBooking(booking) {
  // Implement your database save logic here
  // This could be MongoDB, PostgreSQL, DynamoDB, etc.
  console.log('Saving booking to database:', booking);
  
  // Example implementation:
  // await db.bookings.insertOne(booking);
}

async function updateBookingPaymentStatus(paymentIntentId, status) {
  // Implement your database update logic here
  console.log('Updating booking payment status:', paymentIntentId, status);
  
  // Example implementation:
  // await db.bookings.updateOne(
  //   { stripePaymentIntentId: paymentIntentId },
  //   { $set: { paymentStatus: status } }
  // );
}

// Email functions (implement based on your email service)
async function sendBookingConfirmation(booking) {
  // Implement your email sending logic here
  // This could be SendGrid, AWS SES, Mailgun, etc.
  console.log('Sending booking confirmation email:', booking.customerEmail);
  
  // Example implementation:
  // await emailService.send({
  //   to: booking.customerEmail,
  //   subject: 'Booking Confirmation - Baobab Bound Adventures',
  //   template: 'booking-confirmation',
  //   data: booking
  // });
}

async function sendAdminNotification(booking) {
  // Implement your admin notification logic here
  console.log('Sending admin notification for booking:', booking.id);
  
  // Example implementation:
  // await emailService.send({
  //   to: 'admin@baobabboundadventures.com',
  //   subject: 'New Booking Received',
  //   template: 'admin-booking-notification',
  //   data: booking
  // });
}

async function sendPaymentConfirmation(paymentIntent) {
  // Implement your payment confirmation email logic here
  console.log('Sending payment confirmation:', paymentIntent.id);
}

async function sendPaymentFailureNotification(paymentIntent) {
  // Implement your payment failure notification logic here
  console.log('Sending payment failure notification:', paymentIntent.id);
}

// For local development/testing
if (require.main === module) {
  console.log('Stripe webhook handler loaded successfully');
  console.log('Make sure to set the following environment variables:');
  console.log('- STRIPE_SECRET_KEY');
  console.log('- STRIPE_WEBHOOK_SECRET');
  console.log('- SITE_URL');
}
