export default function PrivacyPolicy() {
  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-secondary">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none text-secondary/80 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-serif font-bold text-secondary mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Make a table reservation</li>
            <li>Fill out a contact form</li>
            <li>Interact with us via WhatsApp</li>
            <li>Subscribe to our newsletter</li>
          </ul>
          <p>This information may include your name, email address, phone number, and any other details you choose to provide.</p>

          <h2 className="text-2xl font-serif font-bold text-secondary mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process and confirm your reservations</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Send you technical notices, updates, and administrative messages</li>
            <li>Communicate with you about products, services, offers, and events</li>
          </ul>

          <h2 className="text-2xl font-serif font-bold text-secondary mt-8 mb-4">3. Information Sharing</h2>
          <p>We do not share your personal information with third parties except as described in this privacy policy or as required by law.</p>

          <h2 className="text-2xl font-serif font-bold text-secondary mt-8 mb-4">4. Data Security</h2>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>

          <h2 className="text-2xl font-serif font-bold text-secondary mt-8 mb-4">5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p>Email: hello@amasfoodandbite.com<br/>Phone: 0816 511 7588</p>
        </div>
      </div>
    </div>
  );
}
