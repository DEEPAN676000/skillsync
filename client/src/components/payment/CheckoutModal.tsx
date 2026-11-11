import React, { useState } from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal.js';
import API from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'course' | 'live_class' | 'booking' | 'subscription';
  itemId: string;
  itemTitle: string;
  itemPrice: number;
  onSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  itemType,
  itemId,
  itemTitle,
  itemPrice,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Create order on backend
      const orderRes = await API.post('/payments/create-order', {
        itemType,
        itemId,
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to create payment order');
      }

      // If item is completely FREE, backend already confirmed enrollment!
      if (orderRes.data.isFree) {
        setPaymentSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
        return;
      }

      const { orderId, amount, currency, keyId, bookingId, paymentId } = orderRes.data;

      // 2. Initialize Razorpay standard checkout
      if (window.Razorpay) {
        const options = {
          key: keyId,
          amount: amount * 100,
          currency: currency || 'INR',
          name: 'SkillSync Marketplace',
          description: `Enrollment for ${itemTitle}`,
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=200',
          order_id: orderId,
          handler: async function (response: any) {
            // 3. Server-side verification (MANDATORY: Never mark as paid on frontend alone!)
            try {
              const verifyRes = await API.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id || orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId,
                paymentId,
              });

              if (verifyRes.data.success) {
                setPaymentSuccess(true);
                setTimeout(() => {
                  onSuccess();
                  onClose();
                }, 1500);
              } else {
                setError(verifyRes.data.message || 'Payment verification failed');
              }
            } catch (verErr: any) {
              setError(verErr.response?.data?.message || 'Server verification failed');
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: {
            color: '#7c3aed',
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setError(resp.error?.description || 'Payment transaction failed');
          setLoading(false);
        });
        rzp.open();
      } else {
        // Fallback server verification simulation for test environment
        const verifyRes = await API.post('/payments/verify', {
          razorpay_order_id: orderId,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: 'test_signature_mock',
          bookingId,
          paymentId,
        });

        if (verifyRes.data.success) {
          setPaymentSuccess(true);
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Secure Checkout" maxWidth="md">
      {paymentSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Payment & Booking Confirmed!</h3>
          <p className="text-xs text-slate-500">
            Your enrollment has been successfully recorded in the database. Redirecting to your content...
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Item Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded uppercase">
                  {itemType.replace('_', ' ')}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">{itemTitle}</h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Total Due</span>
                <span className="text-lg font-black text-slate-900">
                  {itemPrice === 0 ? 'FREE' : `₹${itemPrice}`}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span>Platform Fee & Taxes</span>
              <span className="font-semibold text-emerald-600">Included (₹0)</span>
            </div>
          </div>

          {/* Payment Gateway Trust Badge */}
          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-purple-600 shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-slate-800">100% Secure Razorpay Gateway</p>
              <p className="text-slate-500">256-bit SSL encrypted server-verified transaction</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-brand hover:opacity-95 shadow-lg shadow-purple-500/25 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              {loading
                ? 'Processing...'
                : itemPrice === 0
                ? 'Confirm Free Enrollment'
                : `Pay ₹${itemPrice} with Razorpay`}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

