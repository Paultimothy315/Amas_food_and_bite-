import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { useSettings } from '../../context/SettingsContext';
import SEO from '../../components/utils/SEO';
import { MapPin, Phone, Mail, MessageCircle, CheckCircle2, Instagram, Facebook } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { settings } = useSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      // 1. Save to Firestore (Backup)
      await addDoc(collection(db, 'contacts'), {
        ...data,
        createdAt: serverTimestamp(),
      });

      // 2. Submit to Tally in background via our API proxy
      try {
        fetch('/api/submit-tally', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formId: '5BGvko',
            answers: [
              { fieldId: 'name', value: data.name },
              { fieldId: 'email', value: data.email },
              { fieldId: 'subject', value: data.subject },
              { fieldId: 'message', value: data.message }
            ]
          })
        });
      } catch (tallyError) {
        console.warn("Tally submission failed:", tallyError);
      }

      // format WhatsApp message
      const whatsappNumber = settings.whatsappNumber;
      let messageText = `Hello Ama's Food and Bite, I have an inquiry!\n\n`;
      messageText += `*Name:* ${data.name}\n`;
      messageText += `*Email:* ${data.email}\n`;
      messageText += `*Subject:* ${data.subject}\n`;
      messageText += `*Message:* ${data.message}`;

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;
      
      // Open in new tab to avoid iFrame "Refused to connect"
      window.open(whatsappUrl, '_blank');

      setIsSuccess(true);
      reset();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'contacts');
      alert("There was an error sending your message. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappNumber = settings.whatsappNumber;
  const whatsappMessage = `Hi ${settings.siteName}, I have an inquiry.`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <SEO title={`Contact Us | ${settings.siteName}`} />
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold mb-4 text-secondary">Contact Us</h1>
          <p className="text-secondary/70 text-lg max-w-2xl mx-auto">We'd love to hear from you. Get in touch with us for orders, reservations, or general inquiries.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-surface p-8 rounded-3xl shadow-md border border-border">
              <h2 className="text-2xl font-serif font-bold mb-6 text-secondary">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <Phone className="text-primary mt-1 mr-4 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-secondary">Phone</h3>
                    <p className="text-secondary/70">{settings.contactPhone} / {settings.contactPhoneSecondary}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MessageCircle className="text-primary mt-1 mr-4 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-secondary">WhatsApp</h3>
                    <p className="text-secondary/70 mb-2">Fastest way to order or reach us.</p>
                    <a 
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary font-bold hover:underline"
                    >
                      Chat with us now
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="text-primary mt-1 mr-4 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-secondary">Email</h3>
                    <p className="text-secondary/70">{settings.contactEmail}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="text-primary mt-1 mr-4 flex-shrink-0 flex space-x-2">
                    <Instagram size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-secondary">Social Media</h3>
                    <div className="flex space-x-4 mt-2">
                      <a 
                        href={settings.instagramUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-primary font-bold hover:underline"
                      >
                        <Instagram size={20} className="mr-1" /> Instagram
                      </a>
                      <a 
                        href={settings.facebookUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-primary font-bold hover:underline"
                      >
                        <Facebook size={20} className="mr-1" /> Facebook
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface p-8 rounded-3xl shadow-md border border-border">
              <h2 className="text-2xl font-serif font-bold mb-6 text-secondary">Our Locations</h2>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <MapPin className="text-primary mt-1 mr-4 flex-shrink-0" size={24} />
                  <div className="w-full">
                    <h3 className="font-bold text-lg mb-1 text-secondary">Lokogoma Branch</h3>
                    <p className="text-secondary/70 mb-4">{settings.addressLokogoma}</p>
                    <div className="w-full rounded-xl overflow-hidden shadow-sm bg-gray-200 h-[300px] border border-border">
                      <iframe 
                        src="https://maps.google.com/maps?q=AMA'S%20FOOD%20AND%20BITE%20Lokogoma%20Abuja&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen 
                        loading="lazy"
                        title="AMA'S FOOD AND BITE Lokogoma Map"
                      ></iframe>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="text-primary mt-1 mr-4 flex-shrink-0" size={24} />
                  <div className="w-full">
                    <h3 className="font-bold text-lg mb-1 text-secondary">Durumi Branch</h3>
                    <p className="text-secondary/70 mb-4">{settings.addressDurumi}</p>
                    <div className="w-full rounded-xl overflow-hidden shadow-sm bg-gray-200 h-[300px] border border-border">
                      <iframe 
                        src="https://maps.google.com/maps?q=AMA'S%20FOOD%20AND%20BITE%20Durumi%20Abuja&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen 
                        loading="lazy"
                        title="AMA'S FOOD AND BITE Durumi Map"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-surface p-8 md:p-10 rounded-3xl shadow-xl border border-border">
            {isSuccess ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-serif font-bold mb-4 text-secondary">Message Sent!</h2>
                <p className="text-secondary/70 mb-8">Thank you for reaching out. We've redirected you to WhatsApp so you can send your message directly to our team.</p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-serif font-bold mb-6 text-secondary">Send a Message</h2>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary">Full Name</label>
                    <input
                      {...register("name")}
                      className="w-full p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary">Email Address</label>
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary">Subject</label>
                    <input
                      {...register("subject")}
                      className="w-full p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="How can we help?"
                    />
                    {errors.subject && <p className="text-red-500 text-sm">{errors.subject.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary">Message</label>
                    <textarea
                      {...register("message")}
                      rows={5}
                      className="w-full p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="Your message here..."
                    ></textarea>
                    {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-70"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
