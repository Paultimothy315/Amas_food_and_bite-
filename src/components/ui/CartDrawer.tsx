import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { X, Plus, Minus, Trash2, MessageCircle, Truck, ShoppingBag, Clock, MapPin, User, Phone, UtensilsCrossed, ArrowLeft, ChevronRight, CheckCircle2, Package } from 'lucide-react';
import { cn } from '../../lib/utils';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, addToCart, orderType, setOrderType, clearCart } = useCart();
  
  const [isCheckout, setIsCheckout] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    pickupTime: '',
    deliveryAddress: ''
  });

  if (!isCartOpen) return null;

  const whatsappNumber = "2348165117588";
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatOrderMessage = () => {
    const itemsList = items.map(item => `${item.quantity}x ${item.name} - ₦${(item.price * item.quantity).toLocaleString()}`).join('\n');
    
    let message = `Hello Ama's Food & Bite, I'd like to place an order!\n\n`;
    message += `*Order Type:* ${orderType === 'takeaway' ? 'Takeaway' : 'Delivery'}\n`;
    message += `*Items:*\n${itemsList}\n`;
    message += `*Total:* ₦${cartTotal.toLocaleString()}\n`;
    message += `*Name:* ${formData.fullName}\n`;
    message += `*Phone:* ${formData.phoneNumber}\n`;
    
    if (orderType === 'takeaway') {
      message += `*Pickup Time:* ${formData.pickupTime}`;
    } else {
      message += `*Delivery Address:* ${formData.deliveryAddress}`;
    }
    
    return encodeURIComponent(message);
  };

  const isFormValid = () => {
    const basicInfo = formData.fullName && formData.phoneNumber;
    if (orderType === 'takeaway') {
      return basicInfo && formData.pickupTime;
    }
    return basicInfo && formData.deliveryAddress;
  };

  const handleSendOrder = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      // 1. Prepare Order Data
      const orderData: any = {
        customerName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        orderType: orderType,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: cartTotal,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      if (orderType === 'delivery') {
        orderData.deliveryAddress = formData.deliveryAddress;
      } else {
        orderData.pickupTime = formData.pickupTime;
      }

      // 2. Save to Firestore
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderId(docRef.id);

      // 3. Open WhatsApp
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${formatOrderMessage()}`;
      window.open(whatsappUrl, '_blank');

      // 3. Show Success
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
      alert("There was an error processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestedItems = [
    { id: '12', name: "Chilled Zobo Punch", price: 800, img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=100&q=80" },
    { id: '16', name: "Crispy Seasoned Fries", price: 1200, img: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=100&q=80" },
    { id: '13', name: "Fresh Watermelon Juice", price: 3000, img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=100&q=80" },
    { id: '14', name: "Smoothies", price: 5000, img: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=100&q=80" }
  ];

  const handleClose = () => {
    setIsCartOpen(false);
    setIsCheckout(false);
    setIsSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose}></div>
      <div className="relative w-full max-w-md bg-surface h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-border flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            {isCheckout && !isSuccess && (
              <button 
                onClick={() => setIsCheckout(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-secondary"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-2xl font-serif font-bold text-secondary">
              {isSuccess ? 'Order Confirmed' : isCheckout ? 'Checkout' : 'Your Order'}
            </h2>
          </div>
          <button onClick={handleClose} className="text-secondary/70 hover:text-secondary p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-background/30">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="bg-green-100 p-6 rounded-full">
                <CheckCircle2 size={64} className="text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-secondary">Thank You!</h3>
                <p className="text-secondary/70">Your order has been received and sent to our team via WhatsApp.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm w-full space-y-4">
                <p className="text-sm text-secondary/60">We'll contact you shortly to confirm your order and provide delivery/pickup details.</p>
                <div className="pt-4 border-t border-border flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest mb-1">Order Status</p>
                    <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Pending Confirmation</span>
                  </div>
                  {orderId && (
                    <Link 
                      to={`/track/order/${orderId}`}
                      onClick={handleClose}
                      className="flex items-center justify-center gap-2 bg-primary/10 text-primary py-3 rounded-xl font-bold hover:bg-primary/20 transition-all"
                    >
                      <Package size={18} /> Track My Order
                    </Link>
                  )}
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="w-full bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-primary transition-all shadow-lg"
              >
                Back to Website
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="bg-muted p-6 rounded-full">
                <ShoppingBag size={48} className="text-secondary/30" />
              </div>
              <p className="text-secondary/70 text-lg">Your cart is empty.</p>
              <Link to="/menu" onClick={handleClose} className="bg-primary text-white px-8 py-3 rounded-full font-bold">
                Browse Menu
              </Link>
            </div>
          ) : !isCheckout ? (
            /* Step 1: Cart View */
            <>
              <div className="space-y-4">
                <h3 className="font-bold text-secondary flex items-center gap-2">
                  <UtensilsCrossed size={18} className="text-primary" />
                  Selected Items
                </h3>
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-border">
                    <div className="flex-1">
                      <h3 className="font-bold text-secondary">{item.name}</h3>
                      <p className="text-primary font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center bg-muted rounded-xl p-1">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 text-secondary hover:text-primary transition-colors"><Minus size={14} /></button>
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 text-secondary hover:text-primary transition-colors"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-secondary">You might also like</h3>
                <div className="grid grid-cols-1 gap-3">
                  {suggestedItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-border shadow-sm">
                      <div className="flex items-center space-x-3">
                        <img src={item.img} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-bold text-sm text-secondary">{item.name}</h4>
                          <p className="text-primary text-sm font-medium">₦{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
                        className="p-2 bg-secondary/5 text-secondary rounded-xl hover:bg-primary hover:text-white transition-all"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Step 2: Checkout Form View */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-border">
                <h3 className="font-bold text-secondary mb-3 text-sm uppercase tracking-wider opacity-60">Order Summary</h3>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-secondary/70">{item.quantity}x {item.name}</span>
                      <span className="font-medium text-secondary">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-dashed border-border flex justify-between font-bold text-secondary">
                    <span>Total</span>
                    <span className="text-primary">₦{cartTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-secondary flex items-center gap-2">
                  <Truck size={18} className="text-primary" />
                  Delivery Information
                </h3>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-5">
                  <div>
                    <label className="text-xs font-bold text-secondary/60 uppercase tracking-wider mb-3 block">How would you like your order?</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setOrderType('takeaway')}
                        className={cn(
                          "flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl border-2 font-bold transition-all",
                          orderType === 'takeaway' 
                            ? "bg-secondary/5 border-secondary text-secondary" 
                            : "border-border text-secondary/60 hover:border-secondary/30"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag size={16} className={orderType === 'takeaway' ? "text-primary" : "text-secondary/40"} />
                          <span className="text-sm">Takeaway</span>
                        </div>
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                          orderType === 'takeaway' ? "border-secondary" : "border-border"
                        )}>
                          {orderType === 'takeaway' && <div className="w-2 h-2 rounded-full bg-secondary" />}
                        </div>
                      </button>
                      <button 
                        onClick={() => setOrderType('delivery')}
                        className={cn(
                          "flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl border-2 font-bold transition-all",
                          orderType === 'delivery' 
                            ? "bg-secondary/5 border-secondary text-secondary" 
                            : "border-border text-secondary/60 hover:border-secondary/30"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <Truck size={16} className={orderType === 'delivery' ? "text-primary" : "text-secondary/40"} />
                          <span className="text-sm">Delivery</span>
                        </div>
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                          orderType === 'delivery' ? "border-secondary" : "border-border"
                        )}>
                          {orderType === 'delivery' && <div className="w-2 h-2 rounded-full bg-secondary" />}
                        </div>
                      </button>
                    </div>
                    {orderType === 'delivery' && (
                      <p className="text-[10px] text-primary mt-2 font-medium italic animate-in fade-in slide-in-from-top-1 duration-300">
                        * Delivery charges may apply based on your location.
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
                      <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Full Name" 
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
                      <input 
                        type="tel" 
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Phone Number" 
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    {orderType === 'takeaway' ? (
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
                        <input 
                          type="text" 
                          name="pickupTime"
                          value={formData.pickupTime}
                          onChange={handleInputChange}
                          placeholder="Pickup Time (e.g. 2:30 PM)" 
                          className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-secondary/40" size={18} />
                        <textarea 
                          name="deliveryAddress"
                          value={formData.deliveryAddress}
                          onChange={handleInputChange}
                          placeholder="Delivery Address" 
                          rows={3}
                          className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                        ></textarea>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && !isSuccess && (
          <div className="p-6 border-t border-border bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            {!isCheckout ? (
              /* Cart Footer */
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-secondary/60 text-sm font-bold uppercase tracking-wider block">Total Amount</span>
                    <span className="text-3xl font-bold text-primary">₦{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-secondary/40 block">Items</span>
                    <span className="font-bold text-secondary">{items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsCheckout(true)}
                  className="w-full flex items-center justify-center bg-secondary text-white py-4 rounded-2xl font-bold text-lg hover:bg-secondary/90 transition-all shadow-lg group"
                >
                  Proceed to Checkout
                  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </button>
              </>
            ) : (
              /* Checkout Footer */
              <>
                <button
                  onClick={handleSendOrder}
                  disabled={!isFormValid() || isSubmitting}
                  className={cn(
                    "w-full flex items-center justify-center py-4 rounded-2xl font-bold text-lg transition-all shadow-lg",
                    isFormValid() && !isSubmitting
                      ? "bg-[#25D366] text-white hover:bg-[#1ebe57] hover:-translate-y-1" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <MessageCircle className="mr-2" size={24} /> 
                      {isFormValid() ? 'Send Order' : 'Complete Details'}
                    </>
                  )}
                </button>
                
                {!isFormValid() && (
                  <p className="text-center text-xs text-red-400 mt-3 font-medium animate-pulse">
                    * Please fill in your name, phone, and {orderType === 'takeaway' ? 'pickup time' : 'address'}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
