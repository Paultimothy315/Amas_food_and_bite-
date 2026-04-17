import { MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function WhatsAppButton() {
  const { settings } = useSettings();
  const whatsappNumber = settings.whatsappNumber || "2348165117588";
  const message = `Hello Ama's Food and Bite, I'd like to place an order.`;
  const url = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#1ebe57] transition-colors z-50 flex items-center justify-center animate-bounce"
      aria-label="Order now"
    >
      <MessageCircle size={28} />
    </a>
  );
}
