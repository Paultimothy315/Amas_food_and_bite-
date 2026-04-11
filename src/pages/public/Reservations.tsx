import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { Calendar, Clock, Users, MessageSquare, User, Phone, Mail, CheckCircle2 } from 'lucide-react';

const reservationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal('')),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  guests: z.number().min(1).max(20),
  specialRequests: z.string().max(1000).optional(),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

export default function Reservations() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      guests: 2,
    }
  });

  const onSubmit = async (data: ReservationFormValues) => {
    setIsSubmitting(true);
    try {
      // 1. Save to Firestore (Backup)
      const docRef = await addDoc(collection(db, 'reservations'), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setReservationId(docRef.id);

      // 2. Submit to Tally in background via our API proxy
      try {
        fetch('/api/submit-tally', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formId: '5BGvko',
            answers: [
              { fieldId: 'name', value: data.name },
              { fieldId: 'phone', value: data.phone },
              { fieldId: 'email', value: data.email },
              { fieldId: 'date', value: data.date },
              { fieldId: 'time', value: data.time },
              { fieldId: 'guests', value: data.guests },
              { fieldId: 'requests', value: data.specialRequests }
            ]
          })
        });
      } catch (tallyError) {
        console.warn("Tally submission failed:", tallyError);
      }

      // 3. Format WhatsApp Message
      const whatsappNumber = "2348165117588";
      let message = `Hello Ama's Food & Bite, I'd like to make a reservation!\n\n`;
      message += `*Name:* ${data.name}\n`;
      message += `*Phone:* ${data.phone}\n`;
      if (data.email) message += `*Email:* ${data.email}\n`;
      message += `*Date:* ${data.date}\n`;
      message += `*Time:* ${data.time}\n`;
      message += `*Guests:* ${data.guests}\n`;
      if (data.specialRequests) message += `*Special Requests:* ${data.specialRequests}`;

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');

      setIsSuccess(true);
      reset();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reservations');
      alert("There was an error submitting your reservation. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="pt-32 pb-20 bg-background min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-serif font-bold mb-4 text-secondary">Reservation Received!</h1>
          <p className="text-lg text-secondary/70 mb-8">
            Thank you for booking with Ama's Food & Bite. We've redirected you to WhatsApp to finalize your booking. Please send the pre-filled message to confirm your table.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {reservationId && (
              <Link 
                to={`/track/reservation/${reservationId}`}
                className="bg-secondary text-white px-8 py-3 rounded-full font-bold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Calendar size={18} /> Track My Reservation
              </Link>
            )}
            <button 
              onClick={() => setIsSuccess(false)}
              className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors"
            >
              Make Another Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Info Section */}
          <div className="lg:w-1/3">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-secondary">Reserve Your Seat</h1>
            <p className="text-lg text-secondary/70 mb-8">
              Book your table in advance and skip the wait. Whether it's a family dinner, a date night, or a quick lunch meeting, we've got a spot for you.
            </p>
            
            <div className="bg-muted p-8 rounded-2xl space-y-6">
              <h3 className="font-bold text-xl font-serif text-secondary">What to expect</h3>
              <ul className="space-y-4 text-secondary/80">
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</div>
                  <p>Submit your reservation request using the form.</p>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</div>
                  <p>Our team will review availability for your selected time.</p>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</div>
                  <p>You'll receive a confirmation message once approved.</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:w-2/3 bg-surface p-8 md:p-10 rounded-3xl shadow-xl border border-border">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary flex items-center">
                    <User size={16} className="mr-2 text-primary" /> Full Name *
                  </label>
                  <input
                    {...register("name")}
                    className="w-full p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary flex items-center">
                    <Phone size={16} className="mr-2 text-primary" /> Phone Number *
                  </label>
                  <input
                    {...register("phone")}
                    className="w-full p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    placeholder="0800 000 0000"
                  />
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-secondary flex items-center">
                    <Mail size={16} className="mr-2 text-primary" /> Email Address (Optional)
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary flex items-center">
                    <Calendar size={16} className="mr-2 text-primary" /> Date *
                  </label>
                  <input
                    {...register("date")}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  />
                  {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-secondary flex items-center">
                    <Clock size={16} className="mr-2 text-primary" /> Time *
                  </label>
                  <input
                    {...register("time")}
                    type="time"
                    className="w-full p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  />
                  {errors.time && <p className="text-red-500 text-sm">{errors.time.message}</p>}
                </div>

                {/* Guests */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-secondary flex items-center">
                    <Users size={16} className="mr-2 text-primary" /> Number of Guests *
                  </label>
                  <input
                    {...register("guests", { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max="20"
                    className="w-full p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  />
                  {errors.guests && <p className="text-red-500 text-sm">{errors.guests.message}</p>}
                </div>

                {/* Special Requests */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-secondary flex items-center">
                    <MessageSquare size={16} className="mr-2 text-primary" /> Special Requests (Optional)
                  </label>
                  <textarea
                    {...register("specialRequests")}
                    rows={4}
                    className="w-full p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
                    placeholder="Any allergies, special occasions, or seating preferences?"
                  ></textarea>
                  {errors.specialRequests && <p className="text-red-500 text-sm">{errors.specialRequests.message}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Reserve My Table'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
