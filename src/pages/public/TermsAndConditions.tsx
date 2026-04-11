export default function TermsAndConditions() {
  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-secondary">Terms and Conditions</h1>
        
        <div className="prose prose-lg max-w-none text-secondary/80 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-serif font-bold text-secondary mt-8 mb-4">1. Agreement to Terms</h2>
          <p>By accessing our website, you agree to be bound by these Terms and Conditions and agree that you are responsible for compliance with any applicable local laws.</p>

          <h2 className="text-2xl font-serif font-bold text-secondary mt-8 mb-4">2. Reservations</h2>
          <p>Reservations are subject to availability. We reserve the right to cancel or modify reservations where it appears that a customer has provided an invalid phone number or email, or engaged in fraudulent or inappropriate activity.</p>
          <p>Please notify us at least 2 hours in advance if you need to cancel or modify your reservation. Tables will be held for 15 minutes past the reserved time before being released.</p>

          <h2 className="text-2xl font-serif font-bold text-secondary mt-8 mb-4">3. Menu and Pricing</h2>
          <p>All prices are in Nigerian Naira (₦) and are subject to change without notice. While we strive to keep our online menu updated, items and prices may occasionally differ from our physical locations.</p>

          <h2 className="text-2xl font-serif font-bold text-secondary mt-8 mb-4">4. WhatsApp Ordering</h2>
          <p>Orders placed via WhatsApp are subject to confirmation by our staff. Delivery times are estimates and may vary based on order volume and location.</p>

          <h2 className="text-2xl font-serif font-bold text-secondary mt-8 mb-4">5. Governing Law</h2>
          <p>These terms and conditions are governed by and construed in accordance with the laws of Nigeria.</p>

          <h2 className="text-2xl font-serif font-bold text-secondary mt-8 mb-4">6. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p>Email: hello@amasfoodandbite.com<br/>Phone: 0816 511 7588</p>
        </div>
      </div>
    </div>
  );
}
